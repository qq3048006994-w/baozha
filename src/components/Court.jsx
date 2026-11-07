export default function Court({ image, home = false }) {
  return <div className={`court ${home ? 'court-home' : ''}`} aria-hidden="true">
    {image ? <img className="court-photo" src={image} alt="" /> : <svg className="court-art" viewBox="0 0 1600 1000" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="room" x2="0" y2="1"><stop stopColor="#263b34"/><stop offset="1" stopColor="#0e1916"/></linearGradient>
        <linearGradient id="floor" x2="0" y2="1"><stop stopColor="#36413a"/><stop offset="1" stopColor="#111d18"/></linearGradient>
        <radialGradient id="light"><stop stopColor="#c4b187" stopOpacity=".18"/><stop offset="1" stopColor="#c4b187" stopOpacity="0"/></radialGradient>
        <pattern id="lattice" width="42" height="64" patternUnits="userSpaceOnUse"><path d="M21 0 42 32 21 64 0 32Z" fill="none" stroke="#baa97b" strokeOpacity=".25" strokeWidth="2"/></pattern>
        <pattern id="grain" width="9" height="9" patternUnits="userSpaceOnUse"><path d="M0 3h9M0 8h9" stroke="#e5d7b6" strokeOpacity=".025"/></pattern>
      </defs>
      <rect width="1600" height="1000" fill="url(#room)"/>
      <path d="M0 0 450 360V760L0 1000ZM1600 0 1150 360V760L1600 1000Z" fill="#172920"/>
      <rect x="460" y="330" width="680" height="440" fill="#314239"/><rect x="490" y="360" width="620" height="400" fill="#293c33"/>
      <path d="M0 1000 460 760H1140L1600 1000Z" fill="url(#floor)"/>
      {[0,1,2,3,4,5,6,7,8].map(i=><path key={i} d={`M${460+i*85} 760 ${i*200} 1000`} stroke="#8e927d" strokeOpacity=".18"/>)}
      {[800,850,915,995].map(y=><path key={y} d={`M0 ${y}H1600`} stroke="#8e927d" strokeOpacity=".17"/>)}
      {[0,1,2,3].map(i=><g key={i}>
        <path d={`M${i*95} ${i*80}H${1600-i*190}L${1510-i*95} ${55+i*80}H${90+i*95}Z`} fill="#13221a" stroke="#a58c5d" strokeOpacity=".12" strokeWidth="3"/>
        <path d={`M${100+i*112} ${120+i*75}V${1000-i*70}M${1500-i*112} ${120+i*75}V${1000-i*70}`} stroke="#17271d" strokeWidth={60-i*9}/>
      </g>)}
      <path d="M100 200 400 370V710L100 900Z M1500 200 1200 370V710L1500 900Z" fill="url(#lattice)"/>
      <path d="M640 430H960V530H640Z" fill="#12251b" stroke="#8f805a" strokeWidth="5"/>
      <text x="800" y="494" textAnchor="middle" fill="#b39b68" fontFamily="serif" fontSize="43" letterSpacing="13">明镜高悬</text>
      <path d="M570 560V720M1030 560V720" stroke="#a68e58" strokeOpacity=".6" strokeWidth="2"/>
      <text x="575" y="585" fill="#aa9569" fontFamily="serif" fontSize="18" style={{writingMode:'vertical-rl'}} letterSpacing="8">铁面无私持正气</text>
      <text x="1035" y="585" fill="#aa9569" fontFamily="serif" fontSize="18" style={{writingMode:'vertical-rl'}} letterSpacing="8">清心直道惠黎民</text>
      <path d="M652 685H948V720H652ZM680 720H705V787H680ZM895 720H920V787H895Z" fill="#15231a" stroke="#7f7350" strokeOpacity=".4" strokeWidth="2"/>
      <rect x="757" y="608" width="86" height="77" rx="6" fill="#213329" stroke="#83734e" strokeOpacity=".4"/>
      <path d="M610 780H990L1050 800H550Z" fill="#455047" opacity=".4"/>
      <ellipse cx="1180" cy="500" rx="500" ry="600" fill="url(#light)"/><rect width="1600" height="1000" fill="url(#grain)"/>
    </svg>}
    <div className="court-shade"/><div className="dust dust-one"/><div className="dust dust-two"/>
  </div>
}
