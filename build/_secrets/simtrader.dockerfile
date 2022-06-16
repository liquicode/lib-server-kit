FROM		node:10.19-slim
LABEL		name="simtrader"
LABEL		description="Server to manage users, scores, and historical data."

# Set timezone
# RUN			mv /etc/localtime /etc/localtime.backup
# RUN			ln -s /usr/share/zoneinfo/CST6CDT /etc/localtime

# Copy source files
WORKDIR		/home/app
COPY		. /home/app
RUN			cp build/__secrets/simtrader.config.json app/

# Set initial environment
CMD [ "node", "app/application.js", "config", "show", "--log-levels", "TDIWEF" ]
