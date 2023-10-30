import gsap from 'gsap';

export function Help() {

  return (
    <div className="help">
      <div className='help-button'>?</div>
      <div className="help-window">
        <p>Spacebar: Deploy Trap</p>
        <p>Mouse: Aim</p>
        <p>Left Click: Fire Proton Gun</p>
        <p>
        Drag ghosts into the trap to capture them. 
        Capture as many ghosts as you can before power runs out. Good luck!
        </p>
      </div>
    </div>
  )
}
