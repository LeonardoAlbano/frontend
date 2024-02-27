import { Navbar as NavbarBs, Container} from 'react-bootstrap'

import react from '../../assets/react.svg'
import node from '../../assets/node.svg'
import mysql from '../../assets/mysql.svg'

export function Header() {
    return(
        <NavbarBs sticky='top' className='bg-white shadow-sm mb-5 border-bottom border-4 border-info'>
          <Container className='d-flex justify-content-center align-items-center gap-4'>
            <img src={react} style={{ width: '50px', height: '50px' }} />
            <img src={node} style={{ width: '50px', height: '50px' }} />
            <img src={mysql} style={{ width: '50px', height: '50px' }} />            

          </Container>

        </NavbarBs>
    )
}