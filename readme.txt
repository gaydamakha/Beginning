sudo cp nodeapp.service /etc/systemd/system/nodeapp.service # копируем его куда надо
sudo nano /etc/systemd/system/nodeapp.service # смотрим, [редактируем,] [сохраняем,] закрываем
sudo systemctl daemon-reload # перезагружаем список "демонов"
sudo systemctl start nodeapp # запустить сервис
sudo systemctl enable nodeapp # делаем авто запускаемым при старте системы

# другие действия:
sudo systemctl disable nodeapp # отключаем авто запуск
sudo systemctl stop nodeapp # остановить сервис
sudo systemctl restart nodeapp # перезагрузка
systemctl status nodeapp # посмотреть статус
journalctl -u nodeapp.service # глянуть логи




sudo nano /etc/ssl/ssl_sertificate1.key
