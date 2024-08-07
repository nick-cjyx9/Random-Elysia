# Work in progress!

# Random Elysia

Elysia.js + Drizzle ORM + Cloudflare full-stack example

## 需求描述

做一个前后端分离的随机图片展示，提供 Open API。前端随机展示所有图片，提供赞和踩功能，将其加入随机权重。
后端提供按表情 Tag 筛选图片, page & perPage 分页给数据。
上传后的图片用 AI 打上 Tag 后，ipx 处理，再创建数据库条目

## AI tagger

prompt: `
Please describe the pink hair girl's expression using one or several of these words which you think is most correct:
excited, happy, surprised, fear, sad, shy, disappointed, angry, neutral.
`
![cfplayground](./.readme/img/cfplayground.JPG)
