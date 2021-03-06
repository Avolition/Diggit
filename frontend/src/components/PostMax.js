// import package deps
import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
// import components
import Loader from 'react-loader'
import PostMin from './PostMin'
import Comments from './Comments'
// import action creators
import { createComment } from '../redux/actions/comments'
// import helpers
import { _fetch } from '../js/DiggitAPI'
import uuid from 'uuid/v1'

class PostMax extends Component {
  constructor() {
    super();
    this.state = {
      author: '',
      body: '',
      voted: false
    }
    this._addComment = this._addComment.bind(this)
  }

  _handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value })
  }

  _addComment = (e) => {
    e.preventDefault()
    const id = uuid() // set unique id
    const { post } = this.props
    const options = { // set options
      body: JSON.stringify({
        'id': id,
        'parentId': post.id,
        'timestamp': Date.now(),
        'author': this.state.author,
        'body': this.state.body,
        'commentNum': 0
      })
    }
    _fetch('comments', 'POST', options
      ).then(res => {
        this.props.dispatch(createComment(res))
        this.props.history.push(`/${post.category}/${post.id}`)
        this.setState({ author: '', body: '' })
      }).catch(err => console.log('error adding post', err))
  }

  componentDidMount = () => {
    // if no data populates, redirect to 404 page after 3 seconds
    setTimeout(function() {
      if(document.querySelector('.loader') != null) {
        this.props.history.push(`/error`)
      }
    }.bind(this), 3000)
  }

  render() {

    const { post } = this.props

    return ( 
      <article className='single-view'>
      {post && post.id
        ? <div className='single-view'>
            <ul className='posts'>
              <PostMin postId={post.id} />
            </ul>
            <div className='post-body'>
              <p>{post.body}</p>
            </div>
            <form id='comment-form' className='comment-form' action="/comments" onSubmit={this._addComment} method='POST'>
              <label>Author a Comment</label>
              <input value={this.state.author} onChange={this._handleChange} type="text" name='author' placeholder='author' required />
              <label>Comment Body</label>
              <textarea value={this.state.body} onChange={this._handleChange} name='body' placeholder='body' required />
              <button className='comment-button' type="submit">Submit</button>
            </form>
            <Comments 
              postId={post.id}
            />
          </div>
        : <Loader color="#FFF" />
      }
      </article>
    )
  } // render
} // Component

const mapStateToProps = (state, ownProps) => {
  return {
    post: state.posts[ownProps.match.params.post_id]
  }
} // mapStateToProps

export default connect(mapStateToProps)(withRouter(PostMax))
// withRouter not needed, but leaving in so I can find it later