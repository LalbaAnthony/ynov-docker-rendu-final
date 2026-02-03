FROM netdata/netdata:stable

# Copy custom configuration
COPY netdata.conf /etc/netdata/netdata.conf

# Ensure correct permissions
RUN chown -R netdata:netdata /etc/netdata

EXPOSE 19999
