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

// The default aparameters assume an empty message
function compose_email(subject='', recipients='', body='' ) {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#single-email-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = recipients;
  document.querySelector('#compose-subject').value = `Re: ${subject}`;
  document.querySelector('#compose-body').value = body;
}

// Creates the email element
function renderEmail(id, mailbox) {

  // Toggle the view
  document.querySelector('#single-email-view').style.display = 'block';
  document.querySelector('#emails-view').style.display = 'none';

  const singleEmailView = document.querySelector('#single-email-view .mail-container');

  // Differnt inbox variable elements
  const archive = `
    <button class="btn archive">Archive</button>
  `;
  const reply = `
    <button class="btn reply">Reply</button>
  `;

  // Fetch the specific e-mail using the id passed in as a parameter
  fetch(`/emails/${id}`)
  .then(response => response.json())
  .then(result => {

    // Object destructuring assingment
    const {subject, sender, recipients, body} = result;

    singleEmailView.innerHTML = `
      <div class="single-email">  
        <h3 class="email-subject">${subject}</h3>
        <div class="email-sender">
          <span><strong>Sender</strong>:</span>
          <p>${sender}</p>
        </div>
        <div class="email-recipient">
          <span><strong>Recipient/s</strong>:</span>
          <p>${recipients.join(',')}</p>
        </div>
        <div class="email-body"><span><strong>Message</strong></span>: <p>${body}</p></div>
      </div>
    `;
  })

  .then(() => {
    
    // If inside of inbox, the archive button archives the e-mails
    // Otherwise, unarchive the e-mails
    const archived = mailbox === 'inbox' ? true : false;
    archived ? email.querySelector('.archive').textContent = 'Archive' : email.querySelector('.archive').textContent = 'Unarchive'
 
    document.querySelectorAll('.single-email').forEach((email) => {
      const emailSubject = email.querySelector('.email-subject').textContent;
      const emailSender = email.querySelector('.email-sender p').textContent;
      const emailBody = email.querySelector('.email-body p').textContent;

      email.insertAdjacentHTML('beforeend', reply)
      email.querySelector('.reply').addEventListener('click', () => compose_email(emailSubject, emailSender, emailBody))
      email.querySelector('.archive').addEventListener('click', function() {
        fetch(`/emails/${id}`, {
          method: 'PUT',
          body: JSON.stringify({
            archived: archived
          })
        })
        .then(() => load_mailbox('inbox'))
      })
    })
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

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {

    // Print emails
    result.forEach((mail) => {
      // Read or Unread instead of true or false for legibility, as it used as a class for styling purposes
      const read = mail.read === true ? 'read' : 'unread' 

      // Destructuring assingment
      const {id, sender, subject, recipients} = mail;
      
      const mailTemplate =`
        <div class="card email ${read}" data-id=${id}>
          <p><strong>Sender</strong>: ${sender}</p>
          <p><strong>Subject</strong>: ${subject}</p>
          <p><strong>Recipients</strong>: ${recipients.join(',')}</p>
        </div> 
      `
      emailsView.insertAdjacentHTML('beforeend', mailTemplate)
    })

    // Add event listeners to each email to load the single email view
    document.querySelectorAll('.email').forEach((email) => {
      email.addEventListener('click', function(){
        renderEmail( this.dataset.id, mailbox );
      })
    })
  });
}

function submit_form(e) {
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
      load_mailbox('sent')
  });
}