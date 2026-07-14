# Setup Backend
Write-Host "Setting up Backend..."
New-Item -ItemType Directory -Force -Path "backend"
Set-Location -Path "backend"
npm init -y
npm install express dotenv cors helmet morgan multer @supabase/supabase-js jsonwebtoken bcrypt zod
npm install -D typescript @types/node @types/express @types/cors @types/morgan @types/multer @types/jsonwebtoken @types/bcrypt tsx
npx tsc --init

# Setup Frontend
Set-Location -Path ".."
Write-Host "Setting up Frontend..."
npm create vite@latest frontend -- --template react-ts
Set-Location -Path "frontend"
npm install
npm install react-router-dom axios react-hook-form @hookform/resolvers zod @tanstack/react-query lucide-react date-fns zustand
npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p

Write-Host "Project Setup Complete!"
