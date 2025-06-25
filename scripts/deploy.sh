#!/bin/bash

# Fly.io Deployment Script for Bloodline DNA API
# This script handles the complete deployment process to Fly.io

set -e  # Exit on any error

echo "🚀 Starting Fly.io deployment process..."

# Check if flyctl is installed
if ! command -v flyctl &> /dev/null; then
    echo "❌ Error: flyctl is not installed."
    echo "📝 Please install flyctl first: https://fly.io/docs/getting-started/installing-flyctl/"
    exit 1
fi

# Check if user is logged in to Fly.io
if ! flyctl auth whoami &> /dev/null; then
    echo "❌ Error: Not logged in to Fly.io."
    echo "📝 Please run: flyctl auth login"
    exit 1
fi

# Function to set secrets
set_secrets() {
    echo "🔑 Setting up environment secrets..."
    
    # Read environment variables from .env file if it exists
    if [ -f .env ]; then
        echo "📄 Found .env file, reading variables..."
        
        # Extract variables from .env (excluding comments and empty lines)
        while IFS='=' read -r key value; do
            # Skip comments and empty lines
            if [[ $key =~ ^[[:space:]]*# ]] || [[ -z "$key" ]]; then
                continue
            fi
            
            # Remove quotes from value if present
            value=$(echo "$value" | sed 's/^["'\'']//' | sed 's/["'\'']$//')
            
            echo "Setting secret: $key"
            flyctl secrets set "$key=$value" --app restapi-bloodline-dna
            
        done < .env
    else
        echo "⚠️  Warning: No .env file found. You'll need to set secrets manually."
        echo "📝 Use: flyctl secrets set VARIABLE_NAME=value --app restapi-bloodline-dna"
    fi
}

# Function to deploy application
deploy_app() {
    echo "📦 Building and deploying application..."
    
    # Deploy to Fly.io
    flyctl deploy --app wdp392-restapi-with-nodejs-express-mongodb
    
    if [ $? -eq 0 ]; then
        echo "✅ Deployment successful!"
        echo "🌐 Your API is available at: https://wdp392-restapi-with-nodejs-express-mongodb.fly.dev/"
        echo "📊 Monitor your app: flyctl logs --app wdp392-restapi-with-nodejs-express-mongodb"
    else
        echo "❌ Deployment failed!"
        exit 1
    fi
}

# Function to check app status
check_status() {
    echo "🔍 Checking application status..."
    flyctl status --app wdp392-restapi-with-nodejs-express-mongodb
    
    echo "📋 Recent logs:"
    flyctl logs --app wdp392-restapi-with-nodejs-express-mongodb --lines 20
}

# Main deployment process
main() {
    echo "🏗️  Deploying Bloodline DNA API to Fly.io..."
    echo "📱 App name: wdp392-restapi-with-nodejs-express-mongodb"
    echo "🌍 Region: Singapore (sin)"
    echo ""
    
    # Check if app exists, if not create it
    if ! flyctl apps list | grep -q "wdp392-restapi-with-nodejs-express-mongodb"; then
        echo "🆕 Creating new Fly.io app..."
        flyctl apps create wdp392-restapi-with-nodejs-express-mongodb --org personal
    fi
    
    # Set up secrets
    set_secrets
    
    # Deploy the application
    deploy_app
    
    # Check status
    check_status
    
    echo ""
    echo "🎉 Deployment completed successfully!"
    echo "📝 Useful commands:"
    echo "   - View logs: flyctl logs --app wdp392-restapi-with-nodejs-express-mongodb"
    echo "   - SSH into app: flyctl ssh console --app wdp392-restapi-with-nodejs-express-mongodb"
    echo "   - Scale app: flyctl scale count 2 --app wdp392-restapi-with-nodejs-express-mongodb"
    echo "   - Check status: flyctl status --app wdp392-restapi-with-nodejs-express-mongodb"
}

# Handle script arguments
case "${1:-deploy}" in
    "deploy")
        main
        ;;
    "secrets")
        set_secrets
        ;;
    "status")
        check_status
        ;;
    "logs")
        flyctl logs --app wdp392-restapi-with-nodejs-express-mongodb
        ;;
    *)
        echo "Usage: $0 [deploy|secrets|status|logs]"
        echo "  deploy  - Full deployment process (default)"
        echo "  secrets - Set environment secrets only"
        echo "  status  - Check app status"
        echo "  logs    - View recent logs"
        exit 1
        ;;
esac 