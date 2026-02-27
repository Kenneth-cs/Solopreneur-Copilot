#!/bin/bash
# ============================================================
# 在服务器上手动运行此脚本，配置生产环境变量
# 运行方式：bash 3-setup-env.sh
# ============================================================

cat > /app/solopreneur-copilot/.env.production << 'EOF'
DATABASE_URL="mysql://solopreneur:Solo2026!Prod@127.0.0.1:3306/SuperIndividual"
NEXTAUTH_SECRET="solopreneur-copilot-secret-2026-superindividual-PROD"
NEXTAUTH_URL="http://124.222.88.25"
VOLCANO_API_KEY="659cb065-e180-41cc-9a89-02812211345b"
VOLCANO_MODEL_ID="doubao-seed-2-0-pro-260215"
GITHUB_CLIENT_ID=""
GITHUB_CLIENT_SECRET=""
EOF

echo "✓ 环境变量已写入 /app/solopreneur-copilot/.env.production"
