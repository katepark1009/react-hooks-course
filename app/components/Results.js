import React from 'react'
import { battle } from '../utils/api'
import { FaCompass, FaBriefcase, FaUsers, FaUserFriends, FaCode, FaUser } from 'react-icons/fa'
import Card from './Card'
import PropTypes from 'prop-types'
import Loading from './Loading'
import Tooltip from './Tooltip'
import queryString from 'query-string'
import { Link } from 'react-router-dom'

function ProfileList ({ profile }) {
  return (
    <ul className='card-list'>
      <li>
        <FaUser color='rgb(239, 115, 115)' size={22} />
        {profile.name}
      </li>
      {profile.location && (
        <li>
          <Tooltip text="User's location">
            <FaCompass color='rgb(144, 115, 255)' size={22} />
            {profile.location}
          </Tooltip>
        </li>
      )}
      {profile.company && (
        <li>
          <Tooltip text="User's company">
            <FaBriefcase color='#795548' size={22} />
            {profile.company}
          </Tooltip>
        </li>
      )}
      <li>
        <FaUsers color='rgb(129, 195, 245)' size={22} />
        {profile.followers.toLocaleString()} followers
      </li>
      <li>
        <FaUserFriends color='rgb(64, 183, 95)' size={22} />
        {profile.following.toLocaleString()} following
      </li>
    </ul>
  )
}

ProfileList.propTypes = {
  profile: PropTypes.object.isRequired,
}

function resultReducer (state, action) {
  if( action.type === 'success') {
    return {
      winner: action.players[0],
      loser: action.players[1],
      error: null,
      loading: false
    }
  } else if ( action.type === 'request') {
    return {
      winner: null,
      loser: null,
      error: null,
      loading: true
    }
  } else if ( action.type === 'fail') {
    return {
      ...state,
      error: action.error.message
    }
  } else {
    console.warn(`Error: action type isn't supported.`)
  }
}

export default function Results({location}) {
  const [state, dispatch] = React.useReducer(resultReducer, { winner: null, loser: null, error: null, loading: true })

  const { playerOne, playerTwo } = queryString.parse(location.search)

  React.useEffect(()=> {
    dispatch({type: 'request'})
    
    battle([ playerOne, playerTwo ])
      .then( players => dispatch({type:'success', players}))
      .catch( err => dispatch({type: 'fail', err}))

  }, [playerOne, playerTwo])

  if (state.loading === true) {
    return <Loading text='Battling' />
  }

  if (state.error) {
    return (
      <p className='center-text error'>{state.error}</p>
    )
  }

  return (
    <React.Fragment>
      <div className='grid space-around container-sm'>
        <Card
          header={state.winner.score === state.loser.score ? 'Tie' : 'Winner'}
          subheader={`Score: ${state.winner.score.toLocaleString()}`}
          avatar={state.winner.profile.avatar_url}
          href={state.winner.profile.html_url}
          name={state.winner.profile.login}
        >
          <ProfileList profile={state.winner.profile}/>
        </Card>
        <Card
          header={state.winner.score === state.loser.score ? 'Tie' : 'Loser'}
          subheader={`Score: ${state.loser.score.toLocaleString()}`}
          avatar={state.loser.profile.avatar_url}
          name={state.loser.profile.login}
          href={state.loser.profile.html_url}
        >
          <ProfileList profile={state.loser.profile}/>
        </Card>
      </div>
      <Link
        to='/battle'
        className='btn dark-btn btn-space'>
          Reset
      </Link>
    </React.Fragment>
  )
}