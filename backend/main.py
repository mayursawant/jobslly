"""
Main application module for HealthCare Jobs API.
This is the new modular entry point. The original server.py is preserved for backward compatibility.
"""
from fastapi import FastAPI, APIRouter, Request
from fastapi.responses import RedirectResponse
from starlette.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware

# Import configuration
from config import ROOT_DIR

# Create the main app
app = FastAPI(title="HealthCare Jobs API", version="1.0.0")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


class WWWRedirectMiddleware(BaseHTTPMiddleware):
    """
    Middleware to redirect www subdomain to non-www for SEO consistency.
    Returns 301 Permanent Redirect for all www requests.
    """
    async def dispatch(self, request: Request, call_next):
        host = request.headers.get("host", "")
        
        if host.startswith("www."):
            new_host = host[4:]
            new_url = f"{request.url.scheme}://{new_host}{request.url.path}"
            if request.url.query:
                new_url += f"?{request.url.query}"
            
            return RedirectResponse(url=new_url, status_code=301)
        
        response = await call_next(request)
        return response


# Add middlewares
app.add_middleware(WWWRedirectMiddleware)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Note: Routes are imported from the original server.py for now
# In a full refactor, they would be in separate route modules
# and registered here with:
# from routes import auth, jobs, blog, admin, ai, profiles
# api_router.include_router(auth.router)
# etc.

# For now, we import everything from server.py
# This maintains backward compatibility while we have the new structure ready
print("Main module loaded - importing routes from server.py")

# Import and include all routes from server.py
# This is a transitional approach - routes will be fully modularized in phase 2
try:
    from server import api_router as legacy_router
    # The routes are already on api_router in server.py
    print("Legacy routes imported successfully")
except ImportError as e:
    print(f"Note: Running in standalone mode - {e}")

# Include the API router
app.include_router(api_router)

# Startup event (will be populated from server.py in full migration)
@app.on_event("startup")
async def startup_event():
    print("HealthCare Jobs API starting up...")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
