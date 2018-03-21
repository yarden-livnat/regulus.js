import subprocess
import threading
import testfun

from regulus_file import RegulusFile

def sample_in_thread(reg_file):

    sim_dir = 'temp'
    sim_out = 'new_sample_outputs.csv'
    sim_in = 'new_sample_inputs.csv'

    reg_file.save_sample_inputs(sim_in)
    sample_input = reg_file.report_sample_input()


    if reg_file.name =='deployment':
        subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p',sim_in, '-r', sim_out], check=True)


    if reg_file.name == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)


    reg_file.add_pts_from_csv(sim_dir+'/'+sim_out)
    updated_dataset = reg_file.save_all_pts()
    updated_json = reg_file.save_json()


    if reg_file.name == 'test':
        subprocess.run(['python', 'post.py', '-k', '50', '-d', '4', '--name', 'test', '--all', updated_dataset,'-j', '1', '-t',updated_json],check=True)

    if reg_file.name == 'deployment':
        subprocess.run(['python', 'post.py', '-k', '500', '-d', '6', '--name', 'deployment', '--all',  updated_dataset,'-j', '1', '-t',updated_json],check=True)

    print("New Results are available")

    return

	
def createsample(received, data_dir):
    if received is not None:

        reg_file = RegulusFile()
        reg_file.load_reg_json(spec= received, dir = data_dir)
        reg_file.update(spec = received)

        thread = threading.Thread(target=sample_in_thread, args=[reg_file])
        thread.start()

    return