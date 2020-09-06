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
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

function load_mailbox(mailbox) {

  const emailsView = document.querySelector('#emails-view')
  
  // Show the mailbox and hide other views
  emailsView.style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Show the mailbox name
  emailsView.innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;

  console.log( typeof mailbox, mailbox)

  fetch(`/emails/${mailbox}`)
  .then(response => response.json())
  .then(result => {
      // Print emails
      console.log(result);
      result.forEach((mail) => {
        
        const mailTemplate =`
          <a href="/emails/${mail.id}">
            <div class="card">
              <p><strong>Sender</strong>: ${mail.sender}</p>
              <p><strong>Recipients</strong>: ${mail.recipients.join(',')}</p>
            </div> 
          </a>
        `

        emailsView.insertAdjacentHTML('beforeend', mailTemplate)
      })

      
  });
}

      // foreach e-mail create an Element,

      // If the email is unread, it should appear with a white background.

      // If the email has been read, it should appear with a gray background.

      // Each element should be clickable, surround by <a>
      // The URL should be for the single view (Djando, int?)

      // append that element
      

function submit_form(e) {
  console.log(e)
  e.preventDefault();

  // Capture values
  // recipients, subject, and body
  const recipients = document.querySelector('#compose-recipients').value;
  const subject = document.querySelector('#compose-subject').value;
  const body = document.querySelector('#compose-body').value;

  // Send the values via Fetch to the API

  // All recipients must also be valid users who have registered on this particular web application
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
      // Print result
      console.log(result);
      load_mailbox('sent')
  });
  

  // load the user’s sent mailbox.

}

// API Calls - GET
// /emails/<mailbox> where mailbox is either inbox, sent or archive
// GET /emails/<int:email_id> for a single email

// fetch('/emails/inbox')
// .then(response => response.json())
// .then(emails => {
//     // Print emails
//     console.log(emails);

//     // ... do something else with emails ...
// });

// API Calls - POST
// This needs the recipient, subject and body
// fetch('/emails', {
//   method: 'POST',
//   body: JSON.stringify({
//       recipients: 'baz@example.com',
//       subject: 'Meeting time',
//       body: 'How about we meet tomorrow at 3pm?'
//   })
// })
// .then(response => response.json())
// .then(result => {
//     // Print result
//     console.log(result);
// });

// API Calls - PUT to mark emails as read/unread archived/unarchived
// fetch('/emails/100', {
//   method: 'PUT',
//   body: JSON.stringify({
//       archived: true
//   })
// })