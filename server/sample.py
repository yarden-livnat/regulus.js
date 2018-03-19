import subprocess
import threading
import merge
import json
import post
import load_spec
import run_sim
import testfun

def sample_in_thread(new_reg,dims,sample_input):
    #print(data)
    sim_dir = 'sim'
    sim_out = 'newparams.csv'

    #subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p', sample_input, '-r', sim_out], check=True)

    #run_sim.runwithparam(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p', sample_input, '-r', sim_out])

    # data is a list of new input parameters
    new_input = testfun.load_input(sample_input)

    new_data = testfun.generateres(new_input)

    testfun.savefile(new_data, sim_dir, sim_out)

    print("Simulation Finished")

    merge.mergedata(sim_dir, sim_out, new_reg, dims)

    # Post.py, this will be changed to something else
    #run_sim.runwithparam(['python', 'post.py', '-k', '500', '-d', '6', '--name', 'deployment', '--all', newdata])

    # This will be added later
    # run_sim.runwithparam(['python', 'post.py', '-k', '50', '-d', '6', '--name', 'test', '--all', new_reg])

    print("New Results are available", new_reg)
    return

	
def createsample(received):
    ## Check whether there all the running tasks
    if(received is None):
        received_json = 'spec.json'
        with open(received_json) as json_data:
            received = json.load(json_data)

    [new_reg, dims, sample_input] = load_spec.load(received)  # 'newsamples.csv'

    thread = threading.Thread(target=sample_in_thread, args=[new_reg,dims,sample_input])
    thread.start()
    return