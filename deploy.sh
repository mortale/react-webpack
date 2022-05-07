#!/usr/bin/env sh

# 忽略错误
set -e

npm run build
# 进入待发布的目录
# 如果是发布到自定义域名
# echo 'www.example.com' > CNAME
git clone  https://oauth2:$ACCESS_TOKEN@github.com/mortale/mortale.github.io.git
# git clone  https://github.com/mortale/mortale.github.io.git
cd mortale.github.io
git init
git config user.email $EMAIL
git config user.name "mortale"
# cp -rf ../dist/hashmap.json ../dist/index.html .
rsync -r --delete ../react17/* ./child/react17
git add -A
git commit -m 'react17 update'
# 如果部署到 https://<USERNAME>.github.io
 git push -f https://mortale:$ACCESS_TOKEN@github.com/mortale/mortale.github.io.git master
# 如果是部署到 https://<USERNAME>.github.io/<REPO>
# git push -f git@github.com:<USERNAME>/<REPO>.git master:gh-pages

cd -
