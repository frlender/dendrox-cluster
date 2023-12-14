"""Main Python application file for the EEL-CRA demo."""

import os
import platform
import random
import sys
import tkinter 
import tkinter.filedialog as filedialog

import eel
import csv
import pandas as pd
import seaborn as sb
from dendrox import get_json
import matplotlib.pyplot as plt

# Use latest version of Eel from parent directory
sys.path.insert(1, '../../')


@eel.expose
def selectFile():
    root = tkinter.Tk()
    root.attributes("-topmost", True)
    root.withdraw()
    file_path = filedialog.askopenfilename()
    # print(file_path)
    return file_path

@eel.expose
def selectFolder():
    root = tkinter.Tk()
    root.attributes("-topmost", True)
    root.withdraw()
    directory_path = filedialog.askdirectory()
    print(directory_path)
    return directory_path


def get_delimiter(file_path, bytes = 4096):
    sniffer = csv.Sniffer()
    data = open(file_path, "r").read(bytes)
    delimiter = sniffer.sniff(data).delimiter
    return delimiter

def getfilename(pathx):
	return os.path.splitext(os.path.basename(pathx))[0]

@eel.expose
def getfolder(path):
    return os.path.dirname(path)

@eel.expose
def cluster(inputPath,outputPath,params):
    eval_keys = ['col_cluster','row_cluster',
                 'z_score','standard_scale',
                 'vmin','vmax']
    for key in eval_keys:
        params[key] = eval(params[key])
    params['figsize'] = [params['fig_width'],params['fig_height']]
    del params['fig_width']
    del params['fig_height']

    delim = get_delimiter(inputPath)
    df = pd.read_csv(inputPath,sep=delim,index_col=0)
    # print(df)

    g = sb.clustermap(df,cmap='vlag',**params)
    
    fname = getfilename(inputPath)
    figPath = os.path.join(outputPath,fname+'.png')
    plt.savefig(figPath)
    if params['row_cluster']:
        get_json(g,fname=fname+'_row',out_fld=outputPath)
    if params['col_cluster']:
        get_json(g,row=False,fname=fname+'_col',out_fld=outputPath)
        
    # root_path = eel._get_real_path('src')
    # dest = os.path.join(os.path.dirname(os.path.normpath(root_path)),'public')
    
    root_path = eel._get_real_path('build')
    dest = root_path
    print(dest)
    plt.savefig(os.path.join(dest,'display.png'))
    # root_path2 = eel._get_real_path('build')
    # shutil.copy2(figPath,os.path.join(os.path.dirname(os.path.normpath(root_path)),'public'))
    # shutil.copy2(figPath,root_path2)
    # print(root_path, root_path2)
    return 'display.png'
    # pass
# @eel.expose  # Expose function to JavaScript
# def say_hello_py(x):
#     """Print message from JavaScript on app initialization, then call a JS function."""
#     print('Hello from %s' % x)  # noqa T001
#     eel.say_hello_js('Python {from within say_hello_py()}!')


# @eel.expose
# def expand_user(folder):
#     """Return the full path to display in the UI."""
#     return '{}/*'.format(os.path.expanduser(folder))


# @eel.expose
# def pick_file(folder):
#     """Return a random file from the specified folder."""
#     folder = os.path.expanduser(folder)
#     if os.path.isdir(folder):
#         listFiles = [_f for _f in os.listdir(folder) if not os.path.isdir(os.path.join(folder, _f))]
#         if len(listFiles) == 0:
#             return 'No Files found in {}'.format(folder)
#         return random.choice(listFiles)
#     else:
#         return '{} is not a valid folder'.format(folder)


def start_eel(develop):
    """Start Eel with either production or development configuration."""

    if develop:
        directory = 'src'
        app = None
        page = {'port': 3000}
    else:
        directory = 'build'
        app = 'chrome-app'
        page = 'index.html'

    eel.init(directory, ['.tsx', '.ts', '.jsx', '.js', '.html'])

    # These will be queued until the first connection is made, but won't be repeated on a page reload
    # say_hello_py('Python World!')
    # eel.say_hello_js('Python World!')   # Call a JavaScript function (must be after `eel.init()`)

    eel.show_log('https://github.com/samuelhwilliams/Eel/issues/363 (show_log)')

    eel_kwargs = dict(
        host='localhost',
        port=8080,
        size=(1280, 800),
    )
    try:
        eel.start(page, mode=app, **eel_kwargs)
    except EnvironmentError:
        # If Chrome isn't found, fallback to Microsoft Edge on Win10 or greater
        if sys.platform in ['win32', 'win64'] and int(platform.release()) >= 10:
            eel.start(page, mode='edge', **eel_kwargs)
        else:
            raise


if __name__ == '__main__':
    import sys

    # Pass any second argument to enable debugging
    start_eel(develop=len(sys.argv) == 2)
