import { useActionState, useEffect, useState } from 'react';
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

const handleSubmit = async(_previousState: FormState, formData: FormData) => {
    const name = formData.get('name');
    const email = formData.get('email');
    const date = formData.get('date');
    const startTime = formData.get('from_time');
    const endTime = formData.get('end_time');
    const goal = formData.get('goal');
    const data = { name, email, date, startTime, endTime, goal }
    try {
     const res = await axios.post('http://localhost:4000/api/send-data', data);
      console.log("response", res);
      console.log('Form data submitted successfully!');
    } catch (error) {
      console.error('Error submitting form data:', error);
    }
}


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
  const [_formState, formSubmitAction] = useActionState(handleSubmit as any, formInitialState);
  const [formData, setFormData] = useState<FormState>(formInitialState);
  const [developers, setDevelopers] = useState<string[]>([])

  useEffect(() => {
    const getData = async () => {
      try {
        const res = await axios.get('http://localhost:4000/api/get-developers');
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
  
  const { email, name, from_time, end_time } = formData;
  const isInValidEmail = !!email && !email.includes('onja.org') || !email.includes(name);
   
  return (
    <>
      <header>
        <h1></h1>
      </header>
      <main>
        <img className='logo' src='/onja_logo.svg' alt='Onja logo' />
        <h2>Hello wonderful friend <img className='wave' src='https://emoji.slack-edge.com/TSMBL8WEL/wave-animated/a7b45a3ed9e483da.gif' alt='' /></h2>
        <h2>Fill in the form to schedule a pair programming session with Rinon</h2>
        <form action={formSubmitAction}>
          <fieldset className='name_select'>
            <label htmlFor="name">Select your name</label>
            <select id='name' name='name'>
              {developers.map(name => <option key={name} value={name}>{name}</option>)}
            </select>
          </fieldset>
          <fieldset className={`email_field ${isInValidEmail ? 'invalid' : ''}`}>
            <label htmlFor="email">Enter your Onja Mail?</label>
            <input required onChange={handleFieldChange} type='email' name='email'/>
            {isInValidEmail? <span>You must use your Onja Mail</span>: ''}
          </fieldset>
          <fieldset>
            <label htmlFor="date">When do you plan to have a session?</label>
            <div className='date_field'>
              <input required onChange={handleFieldChange} type='date' name='date'/>
              <div className='time_field'>
                From <input required onChange={handleFieldChange} value={from_time} min="9:00" max="16:00" type='time' name='from_time'  /> 
                to <input required onChange={handleFieldChange} min={from_time} max="16:30" value={end_time} type='time' name='end_time'  />
              </div>
            </div>
          </fieldset>
          <fieldset>
            <label htmlFor="goal">What specific thing do you want to look into together? Leave blank if you don't have anything.</label>
            <textarea onChange={handleFieldChange} name='goal' />
          </fieldset>
          <button className='submit'>Submit</button>
        </form>
      </main>
    </>
  )
}

export default App
