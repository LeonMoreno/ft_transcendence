const BACKEND_URL = "http://localhost:8000";

export async function Profile_html() {
    return `
      <div class="stat-block" id="selfstats" style="display: none;">
          <h3>Profile</h3>
          <div class="d-flex align-items-start">
              <img id="avatarImageURL" src="" class="rounded" alt="Avatar" style="max-width: 300px; height: 300px; object-fit: cover;">
              <table class="table">
                  <thead>
                      <tr class="table-active">
                          <th class="col-2">Username:</th>
                          <td id="username"></td>
                      </tr>
                  </thead>
                  <tbody>
                      <tr>
                          <th>First name:</th>
                          <td id="first_name"></td>
                      </tr>
                      <tr class="table-active">
                          <th>Last name:</th>
                          <td id="last_name"></td>
                      </tr>
                      <tr>
                          <th>Games played:</th>
                          <td id="played"></td>
                      </tr>
                      <tr class="table-active">
                          <th>Games won:</th>
                          <td id="wins"></td>
                      </tr>
                      <tr>
                          <th>Games lost:</th>
                          <td id="losses"></td>
                      </tr>
                      <tr class="table-active">
                          <th>Tournaments won:</th>
                          <td>"Waiting for Rachel"</td>
                      </tr>
                  </tbody>
              </table>
          </div>
      </div>
    `;  
  }
  
  
