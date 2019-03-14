#!/bin/bash
if [ -z "${MONGO1}" ];
then echo "Mongo host not defined";
exit 1
fi

mongodb1=`getent hosts ${MONGO1} | awk '{ print $1 }'`

port=${PORT:-27017}

echo "Waiting for mongo (at host $mongodb1) to start up.."
until mongo --host ${mongodb1}:${port} --eval 'quit(db.runCommand({ ping: 1 }).ok ? 0 : 2)' &>/dev/null; do
  printf '.'
  sleep 1
done
echo "Done"

echo replicaset.sh time now: `date +"%T" `
mongo --host ${mongodb1}:${port} <<EOF
  var cfg = {
        "_id": "${RS}",
        "protocolVersion": 1,
        "members": [
            {
                "_id": 0,
                "host": "${mongodb1}:${port}"
            }
        ]
    };
    rs.initiate(cfg, { force: true });
    rs.reconfig(cfg, { force: true });
    rs.slaveOk();
EOF
