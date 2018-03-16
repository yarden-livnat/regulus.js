import csv
import subprocess
import merge
import os
import threading
import merge
import post
import load_spec

def onExit(output,newparam):
    # Post Process can go here
    print("Simulation Finished")
    newdata = merge.mergedata(output,newparam)
    subprocess.run(['python', 'post.py', '-k', '500', '-d', '6', '--name', 'deployment', '--all', newdata],check=True)
    print("New Results are available")


def sample_in_thread(data,output,newparam):
    print(data,output,newparam)
    subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', output, '-p', data, '-r', newparam], check=True)
    onExit(output,newparam)
    return

def save(data):	
	with open('resample.csv', 'w', newline='') as f:
		writer = csv.writer(f)
		writer.writerows(data)
	
def createsample(received):
    ## Check whether there all the running tasks
    if(received is None):
        #prevdata = 'data/'
        output = 'sim/'
        data = 'newsamples.csv'
        newparam = 'newparams.csv'
        thread = threading.Thread(target=sample_in_thread, args = [data,output,newparam])
        thread.start()

    else:
        output = 'sim/'
        data = load_spec.load(received)#'newsamples.csv'
        newparam = 'newparams.csv'
        thread = threading.Thread(target=sample_in_thread, args=[data, output, newparam])
        thread.start()
    return