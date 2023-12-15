import React, { useRef, useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import Select from './comps/Select'
import * as _ from 'lodash'
import styles from './Home.module.css'

// Point Eel web socket to the instance
export const eel = window.eel
eel.set_host( 'ws://localhost:8080' )

// Expose the `sayHelloJS` function to Python as `say_hello_js`
// function sayHelloJS( x: any ) {
//   console.log( 'Hello from ' + x )
// }
// WARN: must use window.eel to keep parse-able eel.expose{...}
// window.eel.expose( sayHelloJS, 'say_hello_js' )

// Test anonymous function when minimized. See https://github.com/samuelhwilliams/Eel/issues/363
function show_log(msg:string) {
  console.log(msg)
}
window.eel.expose(show_log, 'show_log')

// Test calling sayHelloJS, then call the corresponding Python function
// sayHelloJS( 'Javascript World!' )
// eel.say_hello_py( 'Javascript World!' )

// Set the default path. Would be a text input, but this is a basic example after all
const defPath = '~'
// 
// window.eel.expose(selectFolder,'selectFolder')

interface Params{
  [key:string]:string|number|number[]
}

// interface ParamChoice{

// }

export function App(){
  const [inputPath,setInputPath] = useState<string>()
  const [outputPath,setOutputPath] = useState<string>()
  // const [isRunning, setIsRunning] = useState<boolean>(false)
  const [clusterLabel, setClusterLabel] = useState<string>('Cluster')
  const [imgUrl, setImgUrl] = useState<string>()
  // console.log(isRunning)
  console.log(inputPath)

  const selectFile = () =>
    eel.selectFile()((x:string)=>{
      setInputPath(x)
      if(!outputPath)
        eel.getfolder(x)((x:string)=>setOutputPath(x))
    })
  
  const selectOuputPath = () =>
    eel.selectFolder()((x:string)=>setOutputPath(x))
  
  const cluster = (inputPath:string,outputPath:string,params:Params)=>{
    setClusterLabel('Running')
    eel.cluster(inputPath,outputPath,params)((x:string)=>{
      console.log(x)
      setClusterLabel('Success!')
      setImgUrl(x+'?'+new Date().getTime())
      setTimeout(()=>{setClusterLabel('Cluster')},1250)
    })
  }

  const paramsOptions = {
    method: ['average','single','complete',
      'weighted','centroid','median','ward'],
    metric: ['euclidean','correlation','jaccard','cosine','dice',
      'hamming'],
    z_score: ['None',0,1],
    standard_scale: ['None',0,1],
    fig_width: 10,
    fig_height: 8,
    row_cluster: 'True',
    col_cluster: 'True',
    vmin:'None',
    vmax:'None'
  }

  const paramsInit:Params = {}
  Object.keys(paramsOptions).forEach(k=>{
    const vals = (paramsOptions as any)[k]
    if(_.isArray(vals))
    paramsInit[k] = vals[0]
    else
    paramsInit[k] = vals
  })
  const [params, setParamsRaw] = useState<Params>(paramsInit)

  const setParams = (key:string, val:string|number|number[])=>{
    console.log(val,_.isNumber(val))
    params[key] = val
    setParamsRaw({...params})
  }

  // const mapNoneNum = (x:string|number|boolean|number[])=>{
  //   const x2 = x as number|'None'
  //   return x2 === 'None' ? undefined : x2
  // }
    
  const getComp = (key:string,extra?:Params)=>{
    const paramOptions = (paramsOptions as any)[key] as string|number|(string|number)[]
    if(_.isArray(paramOptions))
      return <Select options={paramOptions} 
      onChange={(val)=>setParams(key,val)}></Select>

    if(_.isNumber(paramOptions))
      return <input type='number' value={params[key] as number} 
        min={extra!.min as number} max={extra!.max as number}
        onChange={(e)=>setParams(key, parseInt(e.target.value))}></input>
    
    if(paramOptions === 'True' || paramOptions === 'False')
      return <span onChange={(e)=>setParams(key,(e.target as HTMLInputElement).value)}>
          <input type='radio' className='radio-left' name={key} 
            defaultChecked={paramOptions==='True'} 
            value={'True'}></input> True
          <input type='radio' name={key} defaultChecked={paramOptions==='False'} 
            value={'False'}></input> False
        </span>

    if(paramOptions === 'None')
      return <span onChange={(e)=>setParams(key,(e.target as HTMLInputElement).value)}>
          <input type='radio' className='radio-left' name={key} defaultChecked value={'None'}></input> None
          <input type='radio' name={key} value={0}></input> 
          {params[key] === 'None' && 'number'}
          {/* the onChange property in the parent div will cover the onChange event of this input */}
          {params[key] !== 'None' && <input className='none-input' type='number' value={params[key] as number} 
            ></input>}
        </span>
  }

  // footer is in index.html
  useEffect(()=>{
    const year = new Date().getFullYear();
    document.getElementsByClassName('footer-inner')[0].textContent = `2015-${year} 3D Medicines Corporation`;
  },[])

  return <main className={styles.main}>
    <div className='header'>DendroX Cluster</div>
    <div className='holder'>
      <div className='text-holder'>This program generates JSON and image inputs to the DendroX app from a delimited text file that contains a labeled matrix. An example input file can be found <a href='https://github.com/frlender/denrox-cluster/tree/main/example_input' rel="noreferrer" target='_blank'>here</a>. The app should be able to infer the delimiter in the input file. The output consists of a PNG file for the cluster heatmap image and two JSON files for the row and column dendrograms. Please use the buttons below to select the input file and the output folder:</div>
      <table>
        <tbody>
        <tr>
          <td className='select-td'>Input file:</td>
          <td><button onClick={selectFile}>Select</button>
              <span className='path'>{inputPath}</span></td>
        </tr>
        <tr>
          <td className='select-td'>Output folder:</td>
          <td><button onClick={selectOuputPath}>Select</button>
              <span className='path'>{outputPath}</span></td>
        </tr>
        </tbody>
      </table>
      <div className='text-holder text-holder2'>The app uses the Python Seaborn.clustermap function to generate figures under the hood. Please check the documentation <a href='https://seaborn.pydata.org/generated/seaborn.clustermap.html' rel="noreferrer" target='_blank'>here</a> and <a href='https://seaborn.pydata.org/generated/seaborn.heatmap.html#seaborn.heatmap'  rel="noreferrer" target='_blank'>here</a> for usage of the following parameters:</div>
      <table>
        <tbody>
        <tr>
          <td>Linkage method:</td>
          <td> {getComp('method')}</td>
        </tr>
        <tr>
          <td>Metric:</td>
          <td> {getComp('metric')}</td>
        </tr>
        <tr>
          <td>Z-score standardization:</td>
          <td> {getComp('z_score')}</td>
        </tr>
        <tr>
          <td>Standard scale:</td>
          <td> {getComp('standard_scale')}</td>
        </tr>
        <tr>
          <td>Row cluster:</td>
          <td>{getComp('row_cluster')}</td>
        </tr>
        <tr>
          <td>Column cluster:</td>
          <td>{getComp('col_cluster')}</td>
        </tr>
        <tr>
          <td>Figure size:</td>
          <td>width: {getComp('fig_width',{min:0,max:50})} &nbsp;
              height: {getComp('fig_height', {min:0,max:50})}
          </td>
        </tr>
        <tr>
          <td>vmin:</td>
          <td> {getComp('vmin')}</td>
        </tr>
        <tr>
          <td>vmax:</td>
          <td> {getComp('vmax')}</td>
        </tr>
        </tbody>
      </table>
      <div className='cluster-btn-div'>
        <button  className='cluster-btn' disabled={!inputPath || !outputPath || clusterLabel === "Running"}
          onClick={()=>{cluster(inputPath!,outputPath!,params)}}>
            {clusterLabel}</button>
      </div>
      {/* <div>
        <button
       onClick={()=>{console.log(params)}}>Test</button>
    </div> */}
      <div className='img'>
        {imgUrl && <img src={imgUrl}></img>}
      </div>
      
    </div>

    

    
  </main>
}

// export class App extends Component<{}, {}> {
//   public state: IAppState = {
//     message: `Click button to choose a random file from the user's system`,
//     path: defPath,
//   }

//   public pickFile = () => {
//     eel.pick_file(defPath)(( message: string ) => this.setState( { message } ) )
//   }

//   public render() {
//     eel.expand_user(defPath)(( path: string ) => this.setState( { path } ) )
//     return (
//       <div className="App">
//         <header className="App-header">
//           <img src={logo} className="App-logo" alt="logo" />
//           <p>{this.state.message}</p>
//           <button className='App-button' onClick={this.pickFile}>Pick Random File From `{this.state.path}`</button>
//         </header>
//       </div>
//     );
//   }
// }

export default App;
