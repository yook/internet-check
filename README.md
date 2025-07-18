# internet-checkerer

Запустить скрипт через PM2:
```bash
pm2 start /home/orangepi/internet-check/checker.js --name internet-check

Проверить статус:
```bash
pm2 status internet-check

Посмотреть логи:
```bash
pm2 logs internet-check
