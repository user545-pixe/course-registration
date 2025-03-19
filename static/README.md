# Course Registration System (Static Demo)

This is a static demo version of the Course Registration System. It simulates the functionality of the full application but does not require a backend server or database.

## Demo Features

- Course registration form with simulated submission
- Admin dashboard with sample data
- Demo login (username: admin, password: admin123)
- Order management interface with view/approve/reject functionality

## Deployment

This static version can be deployed to Surge.sh by following these steps:

1. Install Surge globally:
   ```
   npm install -g surge
   ```

2. Navigate to the static directory:
   ```
   cd static
   ```

3. Deploy to Surge:
   ```
   surge
   ```

4. Or use the npm script:
   ```
   npm run deploy
   ```

## Demo Credentials

**Admin Login:**
- Username: admin
- Password: admin123

## URLs

- Main Registration Form: index.html
- Admin Login: admin.html
- Admin Dashboard: admin-dashboard.html

## Demo Limitations

- Form submissions are not saved to a database
- File uploads are not stored
- All data is simulated with JavaScript
- Refreshing the page will reset all changes 