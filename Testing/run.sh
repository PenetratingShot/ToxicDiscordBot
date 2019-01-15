if ! pgrep -x "node server" > /dev/null
then
	echo "Process Stopped. Restarting"
	node server
fi
