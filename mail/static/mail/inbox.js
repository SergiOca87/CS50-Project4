document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  document.querySelector('#compose-form').addEventListener('submit', submit_form);

  // By default, load the inbox
  load_mailbox('inbox');
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function renderEmail(id, mailbox) {
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';
  const singleEmailView = document.querySelector('#single-email-view .mail-container');
  const archive = `
    <button class="btn archive">Archive</button>
  `;
  const unArchive = `
    <button class="btn unarchive">Unarchive</button>
  `;

  // Fetch the specific e-mail using the id passed in as a parameter
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {
    // Object destructuring assingment
    const {subject, sender, recipients, body, read} = result;

    singleEmailView.innerHTML = `
      <div class="single-email">  
        <h3>${subject}</h3>
        <p><strong>Sender</strong>: ${sender}</p>
        <p><strong>Recipient/s</strong>: ${recipients.join(',')}</p>
        <p><strong>Message</strong>: ${body}</p>
      </div>
      `;
  })

  // Dry those up!
  .then(() => {
    if( mailbox === 'inbox' ) {
      document.querySelectorAll('.single-email').forEach((email) => {
        email.insertAdjacentHTML('beforeend', archive)
        email.querySelector('.btn').addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: true
            })
          })
          load_mailbox('inbox')
        })
      })
    } else if( mailbox === 'archive' ) {
      console.log('archive', mailbox)
      document.querySelectorAll('.single-email').forEach((email) => {
        email.insertAdjacentHTML('beforeend', unArchive)
        email.querySelector('.btn').addEventListener('click', function() {
          fetch(`/emails/${id}`, {
            method: 'PUT',
            body: JSON.stringify({
              archived: false
            })
          })
          load_mailbox('inbox')
        })
      })
    }
  })

  // If an email is clicked, also mark it as read
  fetch(`/emails/${id}`, {
    method: 'PUT',
    body: JSON.stringify({
        read: true
    })
  })
}

function load_mailbox(mailbox) {

  const emailsView = document.querySelector('#emails-view')
  
  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  console.log( typeof mailbox, mailbox)

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
    // Print emails
    console.log(result);
    result.forEach((mail) => {
      // Read or Unread instead of true or false for legibility, as it used as a class for styling purposes
      const read = mail.read === true ? 'read' : 'unread' 
      
      const mailTemplate =`
        <div class="card email ${read}" data-id=${mail.id}>
          <p><strong>Sender</strong>: ${mail.sender}</p>
          <p><strong>Recipients</strong>: ${mail.recipients.join(',')}</p>
        </div> 
      `
      emailsView.insertAdjacentHTML('beforeend', mailTemplate)
    })

    // Add event listeners to each email to load the single email view
    document.querySelectorAll('.email').forEach((email) => {
      email.addEventListener('click', function(){
        return renderEmail( this.dataset.id, mailbox );
      })
    })
  });
}

function submit_form(e) {
  console.log(e)
  e.preventDefault();

  // Capture values
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  fetch('/emails', {
    method: 'POST',
    body: JSON.stringify({
        recipients: recipients,
        subject: subject,
        body: body
    })
  })
  .then(response => response.json())
  .then(result => {
      console.log(result);
      load_mailbox('sent')
  });
}