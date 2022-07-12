# 简易的命令行入门教程:

Git 全局设置:

```bash
git config --global user.name "!0"
git config --global user.email "168618014@qq.com"
```

创建 git 仓库:

```bash
mkdir test
cd test
git init
touch README.md
git add README.md
git commit -m "first commit"
git remote add origin https://github.com/zoushaofei/demo.git
git push -u origin "master"
```

已有仓库?

```bash
cd existing_git_repo
git remote add origin https://github.com/zoushaofei/demo.git
git push -u origin "master"
```
