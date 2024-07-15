import { Suspense, useActionState, useEffect, useState } from 'react';
import './App.css'
import axios from 'axios';

interface FormState {
  name: string;
  email: string;
  date: string;
  from_time: string;
  end_time: string;
  goal: string;
};

function getCurrentDateFormatted() {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based, so we add 1
  const day = String(date.getDate()).padStart(2, '0');
  return `${day}-${month}-${year}`;
}

const BACKEND_URL = "https://pair-programming-scheduler.onrender.com";

const formInitialState = {
  name: '',
  date: getCurrentDateFormatted(),
  email: '',
  goal: '',
  from_time: '02:00',
  end_time: "03:00"
};

type OnChangeEvent = { target: { name: string; value: string; }};

function App() {
  const [formData, setFormData] = useState<FormState>(formInitialState);
  const [submissionStatus, setSubmissionStatus] = useState<"initial" | "submitting" | "submitted" | "failed">('initial');
  const [developers, setDevelopers] = useState<string[]>([])

  const handleSubmit = async(_previousState: FormState, formData: FormData) => {
    const name = formData.get('name');
    const email = formData.get('email');
    const date = formData.get('date');
    const startTime = formData.get('from_time');
    const endTime = formData.get('end_time');
    const goal = formData.get('goal');
    const data = { name, email, date, startTime, endTime, goal }
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
        const devNames = await res.data.data;
        setDevelopers(devNames);
      } catch (error) {
        return error
      }
    };
    getData();
  }, [])

  const handleFieldChange = (e: OnChangeEvent) => {
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
  
  const { email, name, from_time } = formData;
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
          <fieldset className={`email_field ${isInValidEmail ? 'invalid' : ''}`}>
            <label htmlFor="email">Enter your Onja Mail?</label>
            <input required onChange={handleFieldChange} type='email' name='email'/>
            {isInValidEmail ? <span>You must use your Onja email address which includes your name.</span> : ''}
          </fieldset>
          <fieldset>
            <label htmlFor="date">When do you plan to have a session? Please select a date and time</label>
            <div className='date_field'>
              <input required onChange={handleFieldChange} type='date' name='date'/>
              <div className='time_field'>
                From <input required onChange={handleFieldChange} min="9:00" max="16:00" type='time' name='from_time'  /> 
                to <input required onChange={handleFieldChange} min={from_time} max="16:30" type='time' name='end_time'  />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <label htmlFor="goal">What specific thing do you want to look into together? Leave it blank if you don't have anything in mind.</label>
            <textarea onChange={handleFieldChange} name='goal' />
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
