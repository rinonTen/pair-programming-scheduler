import { Suspense, useActionState, useEffect, useState } from 'react';
import './App.css'
import axios from 'axios';

interface FormState {
  name: string;
  mentor: string;
  email: string;
  date: string;
  dev_insight: string;
  feedback: string;
};

const BACKEND_URL = "https://pair-programming-scheduler.onrender.com";
const formInitialState = {
  name: '',
  mentor: '',
  date: '',
  email: '',
  dev_insight: '',
  feedback: ''
};

type OnChangeEvent = { target: { name: string; value: string; }};

function App() {
  const [formData, setFormData] = useState<FormState>(formInitialState);
  const [submissionStatus, setSubmissionStatus] = useState<"initial" | "submitting" | "submitted" | "failed">('initial');
  const [developers, setDevelopers] = useState<string[]>([])
  const [mentorNames, setMentorNames] = useState<string[]>([])
  const handleSubmit = async(_previousState: FormState, formData: FormData) => {
    const name = formData.get('name');
    const mentor = formData.get('mentor');
    const email = formData.get('email');
    const date = formData.get('date');
    const devInsight = formData.get('dev_insight');
    const feedback = formData.get('feedback');

    const data = { name, mentor, email, date, devInsight, feedback }
    setSubmissionStatus("submitting");
    try {
      await axios.post(`${BACKEND_URL}/api/send-data`, data);
      setSubmissionStatus("submitted");
    } catch (error) {
      setSubmissionStatus("failed");
      console.error('Error submitting form data:', error);
    }
}

const [_formState, formSubmitAction ] = useActionState(handleSubmit as any, formInitialState);

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get(`${BACKEND_URL}/api/get-developers`);
        const {devs, mentors} = await res.data;
        setDevelopers(devs);
        setMentorNames(mentors);
      } catch (error) {
        return error
      }
    };
    getData();
  }, [])

  const handleFieldChange = (e: OnChangeEvent) => {
    setSubmissionStatus('initial');
    const { name, value } = e.target;
    if (name === 'from_time') {
      const [hours, minutes] = value.split(':');
      const adjustedHours = Number(hours) + 1;
      const formattedHours = adjustedHours > 9 ? adjustedHours : `0${adjustedHours}`;
      const endTime = `${formattedHours}:${minutes}`;
      setFormData(prev => ({ ...prev, from_time: value, end_time: endTime }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const { email, name } = formData;
  const isInValidEmail = !!email && (!email.includes('onja.org') || !email.includes(name.toLowerCase()));
   
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <main>
        <img className='logo' src='/onja_logo.svg' alt='Onja logo' />
        <h2>Hello wonderful friend <img className='wave' src='https://emoji.slack-edge.com/TSMBL8WEL/wave-animated/a7b45a3ed9e483da.gif' alt='' /></h2>
        <h2>Please fill out the form to schedule a pair programming session with Rinon.</h2>
        <form action={formSubmitAction}>
          <fieldset className='name_select'>
            <label htmlFor="name">Select your name</label>
            <select required={name === 'Select an option'} onChange={handleFieldChange} id='name' name='name'>
              {["Select an option", ...developers].map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </fieldset>
          <fieldset className='name_select'>
            <label htmlFor="mentor">Who did you pair with?</label>
            <select required={name === 'Select an option'} onChange={handleFieldChange} id='mentor' name='mentor'>
              {["Select an option", ...mentorNames].map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </fieldset>
          <fieldset className={`email_field ${isInValidEmail ? 'invalid' : ''}`}>
            <label htmlFor="email">Enter your Onja Mail?</label>
            <input required onChange={handleFieldChange} type='email' name='email' id="email"/>
            {isInValidEmail ? <span>You must use your Onja email address which includes your name.</span> : ''}
          </fieldset>
          <fieldset>
            <label htmlFor="date">When was the session?</label>
            <input required onChange={handleFieldChange} type='date' name='date' id="date"/>
          </fieldset>
          <fieldset>
            <label htmlFor="dev_insight">How did you find the session?</label>
            <textarea onChange={handleFieldChange} name='dev_insight' id="dev_insight" />
          </fieldset>
          <fieldset>
            <label htmlFor="feedback">What would you like to improve on with the session?</label>
            <textarea onChange={handleFieldChange} name='feedback' id="feedback" />
          </fieldset>
          <button disabled={submissionStatus === 'submitting'} className='submit'>Submit</button>
          {submissionStatus === 'submitted' ? 
              <p className='success_message'>Form data submitted successfully!</p> 
              : submissionStatus === 'failed' 
              ? <p className='failing_message'>An error has occured when submitting the form</p> : ''
            }
        </form>
      </main>
    </Suspense>
  )
}

export default App
