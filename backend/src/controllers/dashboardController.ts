import { Request, Response } from 'express';
import { supabase } from '../config/supabase';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    // Total Files
    const { count: totalFiles } = await supabase.from('files').select('*', { count: 'exact', head: true });
    
    // Total FMB, FMX, RDF
    const { count: fmbCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('extension', '.fmb');
    const { count: fmxCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('extension', '.fmx');
    const { count: rdfCount } = await supabase.from('files').select('*', { count: 'exact', head: true }).eq('extension', '.rdf');

    // Storage Used (sum of file_size from file_versions)
    const { data: fileVersions, error: versionError } = await supabase.from('file_versions').select('file_size');
    if (versionError) throw versionError;
    const storageUsed = fileVersions.reduce((acc, curr) => acc + Number(curr.file_size), 0);

    // Latest Upload
    const { data: latestUpload } = await supabase
      .from('file_versions')
      .select('*, files(file_name)')
      .order('upload_date', { ascending: false })
      .limit(5);

    // Most Downloaded
    // Group by file_version_id and count in download_history
    // Since Supabase JS doesn't support group by easily without RPC, we can fetch and group or use a view.
    // For simplicity, we fetch recent downloads or use a custom RPC if available. 
    // Here we'll just fetch the history and group it manually for now.
    const { data: downloads } = await supabase.from('download_history').select('file_version_id, file_versions(files(file_name))');
    
    const downloadCounts: Record<string, { count: number, name: string }> = {};
    if (downloads) {
      downloads.forEach((d: any) => {
        const id = d.file_version_id;
        const name = d.file_versions?.files?.file_name || 'Unknown';
        if (!downloadCounts[id]) {
          downloadCounts[id] = { count: 0, name };
        }
        downloadCounts[id].count += 1;
      });
    }

    const mostDownloaded = Object.values(downloadCounts).sort((a, b) => b.count - a.count).slice(0, 5);

    // Storage by System
    const { data: storageData } = await supabase
      .from('file_versions')
      .select('file_size, files(systems(name))');
      
    const storageBySystem: Record<string, number> = {};
    if (storageData) {
      storageData.forEach((item: any) => {
        const sysName = item.files?.systems?.name || 'Unknown';
        const size = Number(item.file_size) || 0;
        storageBySystem[sysName] = (storageBySystem[sysName] || 0) + size;
      });
    }
    const storageBySystemArray = Object.keys(storageBySystem).map(name => ({
      name,
      size: storageBySystem[name]
    }));

    // Activity Trend (Last 7 Days)
    const trend: Record<string, { date: string, uploads: number, downloads: number }> = {};
    const today = new Date();
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      trend[dateStr] = { date: dateStr, uploads: 0, downloads: 0 };
    }

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: recentUploads } = await supabase
      .from('file_versions')
      .select('upload_date')
      .gte('upload_date', sevenDaysAgo.toISOString());
      
    if (recentUploads) {
      recentUploads.forEach((u: any) => {
        const dateStr = new Date(u.upload_date).toISOString().split('T')[0];
        if (trend[dateStr]) trend[dateStr].uploads += 1;
      });
    }

    const { data: recentDownloads } = await supabase
      .from('download_history')
      .select('download_date')
      .gte('download_date', sevenDaysAgo.toISOString());

    if (recentDownloads) {
      recentDownloads.forEach((d: any) => {
        const dateStr = new Date(d.download_date).toISOString().split('T')[0];
        if (trend[dateStr]) trend[dateStr].downloads += 1;
      });
    }
    
    const activityTrend = Object.values(trend);

    res.status(200).json({
      totalFiles: totalFiles || 0,
      extensions: {
        fmb: fmbCount || 0,
        fmx: fmxCount || 0,
        rdf: rdfCount || 0
      },
      storageUsedBytes: storageUsed,
      latestUploads: latestUpload,
      mostDownloaded,
      storageBySystem: storageBySystemArray,
      activityTrend
    });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
