# internet-checkerer

## Что делает

- Каждую минуту проверяет доступность популярных хостов (Google DNS, Cloudflare и др.) через ping.
- Выводит результат проверки в консоль.
- Если интернет отсутствует, записывает подробности ошибки в файл `internet-check.log`.

## Команды
Запустить скрипт через PM2:
```bash
pm2 start /home/orangepi/internet-check/checker.js --name internet-checker
```
Проверить статус:
```bash
pm2 status internet-checker
```
Посмотреть логи:
```bash
pm2 logs internet-checker
```
