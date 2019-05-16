
function stopnode {
    PORT=$1
        PID=$(lsof -ti:$PORT)

	    if ! [[ "$PID" =~ ^[0-9]+$ ]] ; then
		        echo "no proccess found, nothing to kill."
			    else 
				            echo "killing process $PID running on $PORT"
					            kill -9 $PID
						        fi    
						}

						function main {
							    stopnode 18731
							        stopnode 18732
							}

							main
