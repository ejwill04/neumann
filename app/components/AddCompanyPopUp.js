import React, {Component} from 'react'
import PopUpStateDropDown from './PopUpStateDropDown'
import Dialog from 'material-ui/Dialog'
import FlatButton from 'material-ui/FlatButton'
import RaisedButton from 'material-ui/RaisedButton'
import Button from './Button'
import TextField from 'material-ui/TextField'
import Toggle from 'material-ui/Toggle'
import MenuItem from 'material-ui/MenuItem'
import SelectField from 'material-ui/SelectField'

import AuthService from '../helpers/AuthService'
const auth = new AuthService('z3lAkZTSzkQjkiLGedtGuOcLRCe5czSd', 'gabitron.auth0.com')
let userName = auth.getProfile()

const styles = {
  radioButton: {
    marginTop: 16,
  },
}

export default class AddCompanyPopUp extends Component {
  constructor(props) {
    super(props)
    this.state = {
      city: '',
      cohort: '',
      company_id: '',
      email: '',
      industry: '',
      interviewQuestion: '',
      message: '',
      name: '',
      num_of_emp: '1-10',
      open: false,
      remote_ok: false,
      requiredMessage: '',
      tech_stack: '',
      slack: '',
      state: '',
      selectedState: '',
      value: 1,
      worksThereNow: false,
    }

    this.updateStateState = this.updateStateState.bind(this)
    this.checkFeilds = this.checkFeilds.bind(this)
  }

  postACompany() {
    let {name, industry, tech_stack, remote_ok, num_of_emp} = this.state
    let company = {
      name,
      industry,
      tech_stack,
      remote_ok,
      num_of_emp
    }
    fetch('http://localhost:3000/api/v1/companies',
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(
        company
      ),
    })
      .then((response) => response.json())
      .then((company_id) => {
        this.postALocation(company_id)
        this.state.worksThereNow ? this.updateUser(company_id) : this.updateUser()
        window.location.pathname = `/${this.state.state}`
      })
  }

  postALocation(company_id) {
    this.setState({ company_id: company_id})
    let { city, state } = this.state
    let location = {
      city,
      state,
      company_id
    }
    fetch('http://localhost:3000/api/v1/locations',
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'POST',
      body: JSON.stringify(
        location
      ),
    })
      .then((response) => response.json())
      .then((payload) => {
        this.props.newCompanyAdded(this.state.state)
      })
  }


  updateUser(company_id) {
    let { cohort, slack, email, remote_ok } = this.state
    let id = JSON.parse(localStorage.profile).identities[0].user_id

    let user = {
      cohort,
      slack,
      email,
      company_id,
      remote: remote_ok
    }

    fetch(`http://localhost:3000/api/v1/users/${id}`,
    {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      method: 'PUT',
      body: JSON.stringify(
        user
      ),
    })
      .then((response) => response.json())
      .then((user_id) => {
        this.state.message !== '' ? this.postAReview(user_id) : null
        this.state.interviewQuestion !== '' ? this.postAnInterviewQuestion(user_id) : null
      })
  }

  postAReview(user_id) {
    let { company_id, message } = this.state
    let review = {
      message,
      user_id,
      company_id
    }
    fetch('http://localhost:3000/api/v1/reviews',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(
          review
        ),
      })
      .then((response) => response.json())
  }

  postAnInterviewQuestion (user_id) {
    let { company_id, interviewQuestion } = this.state
    let interview_question = {
      message: interviewQuestion,
      user_id,
      company_id
    }
    fetch('http://localhost:3000/api/v1/interview_questions',
      {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(
          interview_question
        ),
      })
      .then((response) => response.json())
  }

  handleOpen() {
    this.setState({ open: true });
  }

  handleClose() {
    this.setState({ open: false });
    this.setState({ requiredMessage: ''})
  }

  checkFeilds() {
    let { name, city, state } = this.state

    if(name === '' || city === '' || state === '') {
      this.setState({ requiredMessage: 'Please fill out Company Name, City, and State' })
    } else {
      this.postACompany()
      this.handleClose()
    }
  }

  handleSubmit() {
    this.checkFeilds()
  }

  updateStateState(value) {
    this.setState({state: value})
  }

  render() {
    const actions = [
      <FlatButton
        label='Cancel'
        primary={true}
        onTouchTap={() => this.handleClose()}
      />,
      <FlatButton
        label='Submit'
        primary={true}
        keyboardFocused={true}
        onTouchTap={(e) => {
          this.handleSubmit()
          }}
      />,
      <div className='required-error-message'>{this.state.requiredMessage}</div>
    ]

    return (
      <div className='company-btn-container'>
        <p className='user-name'>{userName.name}</p>
        <RaisedButton label='Add A Company'
                      className='add-company-btn'
                      backgroundColor='#00C2D2'
                      onTouchTap={() => this.handleOpen()} />
        <Dialog title='Add A Company'
                actions={actions}
                modal={false}
                open={this.state.open}
                onRequestClose={() => this.handleClose()}
                autoScrollBodyContent={true}>
            <TextField floatingLabelText='Company Name'
                       hintText='Ex: ABC Co.'
                       onChange={(e) => this.setState({name: e.target.value})}></TextField>
            <TextField floatingLabelText='City'
                       hintText='Ex: Denver'
                       onChange={(e) => this.setState({city: e.target.value})}></TextField>
            <PopUpStateDropDown updateStateState={this.updateStateState} />
            <TextField floatingLabelText='Industry'
                       hintText='Ex: Health'
                       onChange={(e) => this.setState({industry: e.target.value})}></TextField>
            <SelectField
              floatingLabelText='# of Employees'
              value={this.state.value}
                          onChange={this.handleChange}>
                       <MenuItem value={1}
                                 primaryText='1-10'
                                 onClick={(e) => this.setState({num_of_emp: '1-10', value: 1})}/>
                       <MenuItem value={2}
                                 primaryText='11-40'
                                 onClick={(e) => this.setState({num_of_emp: '11-40', value: 2})}/>
                       <MenuItem value={3}
                                 primaryText='41-100'
                                 onClick={(e) => this.setState({num_of_emp: '41-100', value: 3})}/>
                       <MenuItem value={4}
                                 primaryText='100+'
                                 onClick={(e) => this.setState({num_of_emp: '100+', value: 4})}/></SelectField>
            <Toggle    label='I work remotely'
                       labelPosition='right'
                       style={styles.toggle}
                       onToggle={(e) => this.setState({ remote_ok: !this.state.remote_ok})}/>
            <TextField floatingLabelText='Tech Stack'
                       hintText='Ex: Java, React'
                       onChange={(e) => this.setState({tech_stack: e.target.value})}></TextField>
            <TextField floatingLabelText='Review'
                       hintText='Ex: ABC Co. has been an awesome experience...'
                       multiLine={true}
                       fullWidth={true}
                       onChange={(e) => this.setState({message: e.target.value})}></TextField>
            <TextField floatingLabelText='Hiring Process'
                       hintText='Time from application to hire, interview questions, number of interview rounds'
                       multiLine={true}
                       fullWidth={true}
                       onChange={(e) => this.setState({interviewQuestion: e.target.value})}></TextField>
            <Toggle    label='I currently work here'
                       labelPosition='right'
                       style={styles.toggle}
                       onToggle={(e) => this.setState({ worksThereNow: !this.state.worksThereNow})}/>
            <TextField floatingLabelText='Slack handle'
                       hintText='Ex: @firstlast'
                       onChange={(e) => this.setState({slack:  e.target.value.substring(0,1) === '@' ? e.target.value : `@${e.target.value}`})}></TextField>
            <TextField floatingLabelText='cohort'
                       hintText='Ex: 1610'
                       onChange={(e) => this.setState({cohort: e.target.value})}></TextField>
            <TextField floatingLabelText='Email Address'
                       hintText='Ex: firstlast@gmail.com'
                       onChange={(e) => this.setState({email: e.target.value})}></TextField>
        </Dialog>
        <Button className='log-out-btn' title='Logout' handleClick={() => auth.logout()}/>
      </div>
    )
  }
}
