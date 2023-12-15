import json
import numpy as np
import os

def get_json_raw(Z,idx_reordered,labels_reordered,fname,fld):
    # Z: the linkage matrix as described here https://docs.scipy.org/doc/scipy/reference/generated/scipy.cluster.hierarchy.linkage.html
    # idx_reordered: reordered index along the specified axis
    # labels_reordered: reordered labels that match the ordering in the clustermap
    # fname: the file name of the output json file
    leaves = [int(x) for x in idx_reordered]
    label_mp = {}
    for leaf, label in zip(leaves,labels_reordered):
        label_mp[str(int(leaf))] = label
        
    nodes = {}
    leaf_ct = len(leaves)
    xs = np.linspace(0,1,leaf_ct)
    xp = {}
    for i, leaf in enumerate(leaves):
        xp[str(leaf)] = xs[i]

    for i, row in enumerate(Z):
        # if (i+1) % 20 == 0:
        #     print(i+1)
        left_idx = str(int(row[0]))
        right_idx = str(int(row[1]))

        x = (xp[left_idx]+xp[right_idx])/2
        key = str(int(leaf_ct+i))
        xp[key] = x
        nodes[key] = {
            'id': key,
            'name': key,
            'leaf':False,
            'link': [left_idx,right_idx],
            'x': x,
            'y': row[2],
            'joints':[key],
            'leaves':[]
            }


        if row[0] in leaves:
            nodes[left_idx] = {'id':left_idx,
                               'name': label_mp[left_idx],
                             'leaf':True,
                             'x':xp[left_idx],
                             'y':0}
            nodes[key]['leaves'].append(left_idx)
        else:
            nodes[key]['leaves'] += nodes[left_idx]['leaves']
            nodes[key]['joints'] += nodes[left_idx]['joints']

        if row[1] in leaves:
            nodes[right_idx] = {'id':right_idx,
                              'name': label_mp[right_idx],
                             'leaf':True,
                             'x':xp[right_idx],
                             'y':0}
            nodes[key]['leaves'].append(right_idx)
        else:
            nodes[key]['leaves'] += nodes[right_idx]['leaves']
            nodes[key]['joints'] += nodes[right_idx]['joints']
            
    with open(os.path.join(fld,f'{fname}.json'),'w') as ff:
        json.dump(nodes,ff)


def get_json(g, row=True, labels=None, fname='nodes', out_fld='.'):
    # g: output object from seaborn.clustermap function
    # row: whether to get json data of the row dendrogram or the column dendrogram
    # labels: text labels in the order as in the input data to clustermap
    # fname: the file name of the output json file
    # out_fld: the output folder to save the json file
    if row:
        leaves = g.dendrogram_row.reordered_ind
        Z = g.dendrogram_row.linkage
    else:
        leaves = g.dendrogram_col.reordered_ind
        Z = g.dendrogram_col.linkage
        
    if labels:
        labels_reordered = labels[leaves]
    elif row and hasattr(g.data,'index'):
        labels_reordered = [str(x) for x in g.data.index[leaves].tolist()]
    elif not row and hasattr(g.data,'columns'):
        labels_reordered = [str(x) for x in g.data.columns[leaves].tolist()]
    else:
        labels_reordered = [str(int(x)) for x in leaves]
    
    get_json_raw(Z,leaves,labels_reordered,fname,out_fld)