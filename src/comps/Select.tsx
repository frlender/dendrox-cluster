import React, { useRef, useState } from 'react';
import * as _ from 'lodash'

interface Option{
    label: string|number,
    value: string|number
}

interface SelectProps{
    options: (string|number|Option)[]
    onChange: (e:string)=>void
}

export default function Select(props:SelectProps){
    // console.log(props)
    const options:{label:string|number,value:string|number}[]
        = props.options.map(function(x){
            if(_.isObject(x))
                return x
            else
                return {label:x,value:x}
        })
    
    return <select onChange={e=>props.onChange(e.target.value)}>
        {options.map((option,i)=>
            <option key={i} value={option.value}>
                {option.label}
            </option>)}
    </select>
}