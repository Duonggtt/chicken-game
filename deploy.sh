#!/bin/bash

# Chicken Shooter Game - Deploy Script

echo "🚀 Deploying Chicken Shooter Game to Vercel..."

# Kiểm tra git status
echo "📋 Checking git status..."
git status

# Add và commit tất cả changes
echo "📦 Adding and committing changes..."
git add .
git commit -m "Deploy: Update for Vercel deployment with MongoDB integration"

# Push lên GitHub
echo "📤 Pushing to GitHub..."
git push origin main

echo "✅ Code pushed to GitHub successfully!"
echo ""
echo "🔗 Next steps:"
echo "1. Đăng nhập Vercel CLI: vercel login"
echo "2. Deploy backend: cd backend && vercel --prod"
echo "3. Deploy frontend: cd .. && vercel --prod"
echo "4. Cập nhật API URL trong database config sau khi có Vercel URL"
echo ""
echo "📖 Xem README-DEPLOY.md để biết chi tiết hướng dẫn deploy"
