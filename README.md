# 简易的命令行入门教程:

Git 全局设置:

```bash
git config --global user.name "!0"
git config --global user.email "zoushaofei@outlook.com"
```

创建 git 仓库:

```bash
echo "# demo" >> README.md
git init
git add README.md
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/zoushaofei/demo.git
git push -u origin main
```

已有仓库?

```bash
git remote add origin https://github.com/zoushaofei/demo.git
git branch -M main
git push -u origin main
```
