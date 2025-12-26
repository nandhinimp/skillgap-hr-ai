# Deploy to Render (Backend) + Netlify (Frontend) - Step by Step

## PART 1: DEPLOY BACKEND ON RENDER

### Step 1: Create Render Account
1. Go to https://render.com
2. Click "Sign up"
3. Choose "Sign up with GitHub"
4. Authorize Render to access your GitHub

### Step 2: Create Web Service
1. After login, click "New +" button (top right)
2. Select "Web Service"
3. Click "Connect a repository"
4. Find and select `skillgap-hr-ai` repo
5. Click "Connect"

### Step 3: Configure Service
You'll see a form. Fill it like this:

**Name**: `skillgap-hr-ai-backend`

**Environment**: Node

**Region**: Choose closest to you (e.g., Singapore, Oregon)

**Build Command**: 
```
cd backend && npm install
```

**Start Command**:
```
node backend/server.js
```

**Plan**: Free (scroll down and select)

### Step 4: Add Environment Variables
1. Scroll down to "Environment" section
2. Click "Add Environment Variable"
3. Add these:

**Variable 1:**
- Key: `GROQ_API_KEY`
- Value: `YOUR_ACTUAL_GROQ_API_KEY` (get from https://console.groq.com)

**Variable 2:**
- Key: `NODE_ENV`
- Value: `production`

**Variable 3:**
- Key: `PORT`
- Value: `5000`

### Step 5: Deploy
1. Click "Create Web Service"
2. Render starts building (takes 2-3 minutes)
3. You'll see "Live" when done

### Step 6: Get Your Backend URL
1. On the service page, look for the URL at top (like `https://skillgap-hr-ai-backend.onrender.com`)
2. **COPY THIS URL** - you'll need it for frontend!

---

## PART 2: UPDATE FRONTEND CODE

### Step 1: Update API URLs
You need to replace all `http://localhost:5000` with your Render URL

**File 1: `frontend/app/analyze/page.jsx`**
Find these lines and update:

OLD:
```javascript
const response = await fetch("http://localhost:5000/analyze", {
```

NEW:
```javascript
const response = await fetch("https://skillgap-hr-ai-backend.onrender.com/analyze", {
```

Find and replace these endpoints:
- `http://localhost:5000/analyze` → `https://skillgap-hr-ai-backend.onrender.com/analyze`

**File 2: `frontend/app/interview/page.jsx`**
Find:
```javascript
const res = await fetch("http://localhost:5000/interview", {
```

Replace with:
```javascript
const res = await fetch("https://skillgap-hr-ai-backend.onrender.com/interview", {
```

Also find `/evaluate-answer` and update it.

**File 3: `frontend/app/results/page.jsx` (if any API calls)**
Update any localhost URLs here too.

### Step 2: Commit Changes
```bash
cd skillgap-hr-ai
git add .
git commit -m "Update API URLs for Render deployment"
git push origin improved
```

---

## PART 3: DEPLOY FRONTEND ON NETLIFY

### Step 1: Create Netlify Account
1. Go to https://netlify.com
2. Click "Sign up"
3. Choose "GitHub"
4. Authorize Netlify

### Step 2: Connect Repository
1. Click "Add new site"
2. Select "Import an existing project"
3. Choose "GitHub"
4. Authorize Netlify to access GitHub
5. Find and select `skillgap-hr-ai` repo
6. Click "Install"

### Step 3: Configure Build Settings
After selecting repo, you'll see build settings:

**Base directory**: 
```
skillgap-hr-ai/frontend
```

**Build command**:
```
npm run build
```

**Publish directory**:
```
.next
```

Click "Show advanced"

### Step 4: Add Environment Variables
Click "New variable" and add:

**Variable 1:**
- Key: `NEXT_PUBLIC_API_URL`
- Value: `https://skillgap-hr-ai-backend.onrender.com`

(Keep other settings as default)

### Step 5: Deploy
1. Click "Deploy site"
2. Netlify starts building (takes 2-3 minutes)
3. You'll get a URL like `https://your-site-123456.netlify.app`

### Step 6: Get Your Frontend URL
1. After deployment completes, copy your Netlify URL
2. This is your live app!

---

## TESTING YOUR DEPLOYMENT

### Test Backend First
1. Open browser
2. Go to: `https://skillgap-hr-ai-backend.onrender.com/` 
3. You should see some response (or 404 is fine, means server is running)

### Test Frontend
1. Go to your Netlify URL: `https://your-site.netlify.app`
2. Try uploading a resume
3. Check if it works!

### If Backend Fails to Start
1. Go to Render dashboard
2. Click your service
3. Go to "Logs" tab
4. Look for error messages
5. Common issues:
   - `GROQ_API_KEY` not set → Add in Environment
   - Wrong start command → Should be `node backend/server.js`
   - `npm install` didn't run → Check Build Command

### If Frontend Can't Reach Backend
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for errors mentioning the API
4. Check if API URL in code matches Render URL exactly

---

## QUICK REFERENCE

### Render Backend URL Format
```
https://skillgap-hr-ai-backend.onrender.com
```

### API Endpoints (Replace localhost with above)
- Analyze: `/analyze`
- Interview: `/interview`
- Evaluate: `/evaluate-answer`

### Complete URLs After Deployment
- Analyze: `https://skillgap-hr-ai-backend.onrender.com/analyze`
- Interview: `https://skillgap-hr-ai-backend.onrender.com/interview`
- Evaluate: `https://skillgap-hr-ai-backend.onrender.com/evaluate-answer`

---

## TROUBLESHOOTING

### Render Build Fails
**Check:**
- Is `backend/package.json` present?
- Is `backend/server.js` the correct entry file?
- Are all dependencies listed in `package.json`?

**Solution:**
- Go to Render dashboard → Logs
- Read error message
- Fix issue locally
- Push to GitHub → Render auto-rebuilds

### Netlify Build Fails
**Check:**
- Is `frontend/package.json` present?
- Did you set "Base directory" to `skillgap-hr-ai/frontend`?

**Solution:**
- Go to Netlify → Site settings → Build & deploy
- Check build logs
- Fix and push to GitHub

### Frontend Shows Blank or Errors
1. Open DevTools (F12)
2. Check Console tab for errors
3. Check Network tab - see if API calls succeed
4. If "CORS error" → Backend needs CORS setup
5. If "Cannot reach API" → Update URLs in code

### Cold Start Takes Long
- First request to Render takes 30 seconds (normal)
- Subsequent requests are instant
- Keep the free tier active (don't delete after 15 days)

---

## FINAL CHECKLIST

- [ ] Render backend deployed and "Live"
- [ ] Copied Render URL
- [ ] Updated all API URLs in frontend code
- [ ] Pushed changes to GitHub
- [ ] Netlify frontend deployed and "Published"
- [ ] Tested backend URL in browser
- [ ] Tested frontend upload feature
- [ ] Data flows from frontend → backend → response works

---

## DONE! 🎉

Your app is now live at:
- **Frontend**: `https://your-site.netlify.app`
- **Backend**: `https://skillgap-hr-ai-backend.onrender.com`

Every time you push to GitHub, both services auto-update!
