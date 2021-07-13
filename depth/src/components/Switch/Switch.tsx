import { FC, useState } from 'react';
import './Switch.css';

interface SwitchProps {
  checked ?:boolean;
  onToggle ?:Function;
  className ?:string;
}

const Switch:FC<SwitchProps> = (props) => {

  const [checked, setChecked] = useState(props.checked ? true : false);

  const switchToggleEvent = () => {
    setChecked(!checked);
    if (props.onToggle)
      props.onToggle();
  }
  
  return (
  <label className={props.className ? "switch " + props.className : "switch"}>
    <input type="checkbox" checked={ checked } onChange={switchToggleEvent} />
    <span className="slider round" />
  </label>
)};

export default Switch;
