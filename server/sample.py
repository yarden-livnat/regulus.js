import csv
#import subprocess
import merge
import os
import threading
import merge
import post
import load_spec
import run_sim



def sample_in_thread(data,old_reg, new_ver):
    sim_dir = 'sim/'
    sim_out = 'newparams.csv'

    ##subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', output, '-p', data, '-r', newparam], check=True)
    run_sim.runwithparam(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p', data, '-r', sim_out])
    print("Simulation Finished")

    newdata = merge.mergedata(sim_dir, sim_out, old_reg, new_ver)

    # Post.py, this will be changed to something else
    run_sim.runwithparam(['python', 'post.py', '-k', '500', '-d', '6', '--name', 'deployment', '--all', newdata])

    print("New Results are available")
    return

	
def createsample(received):
    ## Check whether there all the running tasks
    if(received is None):
        data = 'newsamples.csv'
    else:
        [data,old_reg,new_ver] = load_spec.load(received)  # 'newsamples.csv'

    thread = threading.Thread(target=sample_in_thread, args=[data,old_reg, new_ver])
    thread.start()
    return