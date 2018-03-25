import subprocess
import testfun
from regulus_file import RegulusFile
from linearfit import linearfit
sim_dir = 'temp'
sim_out = 'new_sample_outputs.csv'
sim_in = 'new_sample_inputs.csv'



def sample(spec, data_dir):
    reg_file = RegulusFile()
    reg_file.load_reg_json(spec=spec, dir=data_dir)
    reg_file.update(spec=spec)
    reg_file.save_sample_inputs(sim_in)


    sample_input = reg_file.report_sample_input()

    if reg_file.name == 'deployment':
        subprocess.run(['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p',sim_in, '-r', sim_out], check=True)
    elif reg_file.name == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)
    else:
        print("can't resample for selected data")
        exit(255)

    dims = len(reg_file.dims)
    name = reg_file.name

    reg_file.add_pts_from_csv(sim_dir+'/'+sim_out)
    updated_dataset = reg_file.save_all_pts()
    updated_json = reg_file.save_json()


    status = {}

    status = subprocess.run(['python', 'post.py', '-d', str(dims), '--name', name, '--p', updated_json])

    #if reg_file.name == 'test':
    #    status = subprocess.run(['python', 'post.py', '-k', '50', '-d', '4', '--name', 'test', updated_json])
    #elif reg_file.name == 'deployment':
    #else:
    #    print("can't resample for selected data")
    #    exit(255)
    linearfit(updated_json)

    print("New Results are available")
    return status.returncode


def sample_without_processing(spec, data_dir):
    reg_file = RegulusFile()
    reg_file.load_reg_json(spec=spec, dir=data_dir)
    reg_file.update(spec=spec)
    reg_file.save_sample_inputs(sim_in)

    sample_input = reg_file.report_sample_input()

    if reg_file.name == 'deployment':
        subprocess.run(
            ['python', '-m', 'scenario', '-t', 'Transition_scenario.xml', '-o', sim_dir, '-p', sim_in, '-r', sim_out],
            check=True)
    elif reg_file.name == 'test':
        new_input = testfun.load_input(sample_input)
        new_data = testfun.generateres(new_input)
        testfun.savefile(new_data, sim_dir, sim_out)
    else:
        print("can't resample for selected data")
    reg_file.add_pts_from_csv(sim_dir + '/' + sim_out)
    updated_dataset = reg_file.save_all_pts()
    updated_json = reg_file.save_json()

    print("New Results are available")
    # Adding a dummy subprocess here?



# def createsample(received, data_dir):
#     if received is not None:
#
#         reg_file = RegulusFile()
#         reg_file.load_reg_json(spec= received, dir = data_dir)
#         reg_file.update(spec = received)
#
#         thread = threading.Thread(target=sample_in_thread, args=[reg_file])
#         thread.start()
#
#     return

if __name__ == '__main__':
    pass
