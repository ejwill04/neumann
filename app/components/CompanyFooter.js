import React, { Component } from 'react';
import {Tabs, Tab} from 'material-ui/Tabs';
import Button from './Button'
import AddCompanyInfoPopUp from './AddCompanyInfoPopUp'
import RenderCompanyComment from './RenderCompanyComment'

export default class CompanyFooter extends Component {
  constructor(props) {
    super(props)
    this.state  = {
      renderedSection: 'Reviews',
      companyReviews: [],
      companyInterviews: [],
      user_id: '',
      param_name: 'reviews',
      text: 'Review'
    }
    this.getReviews = this.getReviews.bind(this)
    this.getHiring = this.getHiring.bind(this)
    this.postAComment = this.postAComment.bind(this)
    this.dataSelector = this.dataSelector.bind(this)
    this.updateStateAfterPost = this.updateStateAfterPost.bind(this)
    this.deleteAComment = this.deleteAComment.bind(this)
    this.updateRenderedSection = this.updateRenderedSection.bind(this)
  }

  componentWillMount() {
    if (localStorage.profile) {
      let user_id = JSON.parse(localStorage.profile).identities[0].user_id
      this.setState({ user_id })
    }
  }

  componentWillReceiveProps(newProps) {
    if (this.props !== newProps) {
      this.getReviews(newProps.data.id)
      this.getHiring(newProps.data.id)
    }
  }

  getReviews(company_id) {
    this.state.companyReviews = []
    fetch(`http://localhost:3000/api/v1/reviews/company/${company_id}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(response => {
      this.setState({ companyReviews: response })
    })
    .catch(err => {
      this.setState({ companyReviews: [] })
    })
  }

  getHiring(company_id) {
    this.state.companyInterviews = []
    fetch(`http://localhost:3000/api/v1/interview_questions/company/${company_id}`, {
      method: 'GET',
    })
    .then(response => response.json())
    .then(response => {
      this.setState({ companyInterviews: response })
    })
    .catch(err => {
      this.setState({ companyInterviews: [] })
    })
  }

  postAComment(company_id, param_name, message) {
    let comment = {
      message,
      user_id: this.state.user_id,
      company_id
    }

    fetch(`http://localhost:3000/api/v1/${param_name}`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(
        comment
      ),
    })
      .then((response) => response.json())
      .then((payload) => this.updateStateAfterPost(param_name, payload))
  }

  updateStateAfterPost(param_name, payload) {
    if (param_name === 'reviews') {
      this.setState({ companyReviews: payload })
    } else if (param_name === 'interview_questions') {
      this.setState({ companyInterviews: payload })
    }
  }

  deleteAComment(id, company_id) {
    let { renderedSection } = this.state
    let param_name = renderedSection === 'Reviews' ? 'reviews' : 'interview_questions'
    fetch(`http://localhost:3000/api/v1/${param_name}/${id}`,
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'DELETE',
      })
        .then((response) => response.json())
        .then((payload) => {
          if (payload === 'deleted') {
            renderedSection === 'Reviews' ? this.getReviews(company_id) : this.getHiring(company_id)
          }
        })
  }

  updateRenderedSection(section) {
    let param_name
    let text
    if (section === 'Reviews') {
      text = 'Review'
      param_name='reviews'
    } else if (section === 'Hiring Information') {
      text = 'Hiring Process'
      param_name='interview_questions'
    }
    this.setState({ renderedSection: section, param_name, text })
  }

  dataSelector() {
    return this.state.renderedSection === 'Reviews' ? this.state.companyReviews : this.state.companyInterviews
  }

  render() {
    return (
      <section id='company-footer'>
        <div className='company-footer'>
          <Tabs tabItemContainerStyle={{backgroundColor: '#00C2D2'}}>
            <Tab id='reviews-tab'
              label='Reviews'
              value='Reviews'
              onClick={()=> this.updateRenderedSection('Reviews')}>
              </Tab>
              <Tab id='hiring-tab'
                label='Hiring Process'
                value='Hiring Process'
                onClick={()=> this.updateRenderedSection('Hiring Information')}>
                </Tab>
              </Tabs>
            </div>
            <div className='user-comments'>
              <AddCompanyInfoPopUp company_id={this.props.data.id}
                postAComment={this.postAComment}
                text={this.state.text}
                param_name={this.state.param_name} />
              <RenderCompanyComment className='scroll-comments' data={this.dataSelector()} user_id={this.state.user_id} company_id={this.props.data.id} deleteAComment={this.deleteAComment} />
            </div>
      </section>
    )
  }
}
