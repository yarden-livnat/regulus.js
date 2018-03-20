import subprocess
import threading
import merge
import json
import post
import load_spec
import run_sim
import testfun

def sample_in_thread(new_reg,dims,sample_input,data_dir):
    #print(data)
    sim_dir = 'temp'
    sim_out = 'newparams.csv'

    # CSV file as input for cyclus
    param = load_spec.save_list(sample_input)

    ###Simulation###

    #subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p',param, '-r', sim_out], check=True)

    #run_sim.runwithparam(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p', sample_input, '-r', sim_out])

    # data is a list of new input parameters
    new_input = testfun.load_input(sample_input)

    new_data = testfun.generateres(new_input)

    testfun.savefile(new_data, sim_dir, sim_out)

    ###Simulation###

    print("Simulation Finished")

    new_csv = merge.mergedata(sim_dir, sim_out, new_reg, dims, data_dir)

    #Post.py, this will be changed to something else
    #run_sim.runwithparam(['python', 'post.py', '-k', '500', '-d', '6', '--name', 'deployment', '--all', newdata])
    subprocess.run(['python', 'post.py', '-k', '50', '-d', '4', '--name', 'test', '--all', new_csv,'-j', '1', '-t',new_reg],check=True)
    # This will be added later
    # run_sim.runwithparam(['python', 'post.py', '-k', '50', '-d', '6', '--name', 'test', '--all', new_reg])

    print("New Results are available")#, new_reg)
    return

	
def createsample(received, data_dir):
    ## Check whether there all the running tasks
    if(received is None):
        received_json = 'spec.json'
        with open(received_json) as json_data:
            received = json.load(json_data)

    [new_reg, dims, sample_input] = load_spec.load(received,data_dir)  # 'newsamples.csv'

    thread = threading.Thread(target=sample_in_thread, args=[new_reg,dims,sample_input, data_dir])
    thread.start()
    return