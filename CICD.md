# CI/CD Pipeline Documentation

## Table of Contents
1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Pipeline Workflows](#pipeline-workflows)
4. [GitHub Actions vs GitLab CI](#github-actions-vs-gitlab-ci)
5. [AWS EC2 Deployment](#aws-ec2-deployment)
6. [Service Dependencies](#service-dependencies)
7. [Configuration Guide](#configuration-guide)
8. [Replication Instructions](#replication-instructions)
9. [Troubleshooting](#troubleshooting)

## Overview

This repository implements a comprehensive CI/CD pipeline using GitHub Actions for automated testing, building, and deployment of the SatoshiFund application backend. The pipeline supports both development and production environments with AWS EC2 as the primary deployment target.

### Key Features
- Automated testing with Jest across multiple Node.js and MongoDB versions
- Docker containerisation and registry management
- AWS EC2 deployment using AWS Systems Manager (SSM)
- Reusable workflow components following DRY principles
- Environment-specific configurations
- Comprehensive artifact and log persistence

## Architecture

### Pipeline Architecture Diagram

```mermaid
graph TD
    A[Developer Push] --> B{Branch Check}
    B -->|production| C[CI Production Workflow]
    B -->|main/feat| D[CI Dev Workflow]
    
    C --> E[Setup & Cache]
    C --> F[Matrix Testing]
    C --> G[Docker Build]
    C --> H[AWS EC2 Deploy]
    
    D --> I[Setup & Cache]
    D --> J[Quick Tests]
    
    E --> F
    F -->|Pass| G
    G -->|Success| H
    H --> K[Production Environment]
    
    I --> J
    J --> L[Development Feedback]
    
    M[Manual Trigger] --> C
    N[Pull Request] --> C
    O[Schedule/Cron] --> C
```

### Component Structure

```
.github/
├── workflows/
│   ├── ci-production.yml    # Main production CI/CD pipeline
│   ├── ci-dev.yml           # Development CI pipeline
│   └── setup.yml            # Reusable setup workflow
```

## Pipeline Workflows

### 1. Production CI/CD (`ci-production.yml`)

**Triggers:**
- Push to `production` branch
- Pull requests to `production` branch
- Manual workflow dispatch
- Scheduled runs (optional)

**Jobs:**

#### Test Job
- **Purpose**: Run comprehensive test suite
- **Matrix Strategy**: 
  - Node.js versions: 20, 22
  - MongoDB versions: 6.0, 7.0
- **Steps**:
  1. Checkout code
  2. Setup Node.js with npm caching
  3. Install dependencies
  4. Run Jest tests with coverage
  5. Upload test artifacts and logs

#### Build Job
- **Purpose**: Build and push Docker image
- **Dependencies**: Requires test job success
- **Steps**:
  1. Checkout code
  2. Set up Docker Buildx
  3. Login to Docker Hub
  4. Build Docker image
  5. Push to Docker Hub with version tags

#### Deploy Job
- **Purpose**: Deploy to AWS EC2
- **Dependencies**: Requires build and test job success
- **Condition**: Only on production branch push
- **Steps**:
  1. Configure AWS credentials
  2. Create production docker-compose configuration
  3. Deploy via AWS SSM to EC2 instance
  4. Perform health checks
  5. Log deployment status

### 2. Development CI (`ci-dev.yml`)

**Triggers:**
- Push to `main` branch
- Push to `feat/*` branches

**Features:**
- Lightweight testing without deployment
- Single Node.js version (22)
- MongoDB 7.0 for testing
- Quick feedback loop

### 3. Reusable Setup (`setup.yml`)

**Purpose**: Shared configuration workflow
- Node.js environment setup
- Dependency caching
- MongoDB service configuration
- Common environment variables

## GitHub Actions vs GitLab CI

### Comparison Table

| Feature | GitHub Actions | GitLab CI |
|---------|---------------|-----------|
| **Configuration** | YAML in `.github/workflows/` | `.gitlab-ci.yml` in root |
| **Runners** | GitHub-hosted or self-hosted | GitLab-hosted or self-hosted |
| **Pricing** | Free tier with limits | Free tier with limits |
| **Syntax** | `jobs`, `steps`, `uses` | `stages`, `jobs`, `script` |
| **Reusability** | Reusable workflows, composite actions | Templates, includes |
| **Marketplace** | Extensive action marketplace | Limited marketplace |
| **Integration** | Native GitHub integration | Native GitLab integration |
| **Secrets** | Repository/organization secrets | CI/CD variables |
| **Artifacts** | Built-in artifact storage | Built-in artifact storage |
| **Matrix Builds** | Native matrix strategy | Parallel matrix |

### Migration Example

**GitHub Actions (current):**
```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run tests
        run: npm test
```

**GitLab CI equivalent:**
```yaml
test:
  stage: test
  image: node:22
  script:
    - npm install
    - npm test
```

### Why GitHub Actions?

After evaluating both GitHub Actions and GitLab CI for this project's CI/CD requirements, GitHub Actions was selected as the optimal solution for several compelling reasons:

**Native GitHub Integration**: Since the codebase is hosted on GitHub, using GitHub Actions provides seamless integration without requiring external service connections, webhook configurations, or additional authentication setup. This native integration ensures better security and reduces potential points of failure in the pipeline.

**Superior Marketplace Ecosystem**: GitHub Actions offers an extensive marketplace with thousands of pre-built, community-maintained actions. Critical actions like `aws-actions/configure-aws-credentials`, `docker/setup-buildx-action`, and `actions/setup-node` are officially maintained and regularly updated, significantly reducing implementation complexity and maintenance overhead compared to GitLab CI's more limited selection of pre-built components.

**Cost-Effective for Our Scale**: GitHub Actions provides 2,000 free minutes per month for private repositories and unlimited minutes for public repositories, compared to GitLab CI's 400 minutes per month on the free tier. This generous allocation allows for extensive testing across our matrix strategy without incurring additional costs during development and early production phases.

**Advanced Matrix Strategy Support**: GitHub Actions' native matrix strategy implementation makes it straightforward to test across multiple Node.js versions (20, 22) and MongoDB versions (6.0, 7.0) in parallel. This capability is crucial for ensuring compatibility and is more intuitive to configure than GitLab CI's parallel job definitions.

**Enterprise-Ready AWS Integration**: The availability of official AWS actions and first-class support for AWS Systems Manager (SSM) makes our EC2 deployment more reliable and secure. GitHub's partnership with AWS ensures these integrations are maintained and updated regularly, providing better long-term stability than third-party GitLab CI solutions.

**Team Expertise and Productivity**: The development team's existing familiarity with GitHub workflows reduces onboarding time, speeds up troubleshooting, and improves overall maintenance efficiency. This expertise translates directly into faster iteration cycles and more reliable deployments.

## AWS EC2 Deployment

### Deployment Architecture

```mermaid
graph LR
    A[GitHub Actions] -->|AWS SSM| B[EC2 Instance]
    B --> C[Docker Engine]
    C --> D[API Container]
    C --> E[MongoDB Container]
    D <--> E
    F[Docker Hub] -->|Pull Image| C
    G[Load Balancer] --> D
```

### EC2 Instance Requirements

- **Instance Type**: t2.micro (free tier eligible)
- **OS**: Ubuntu 22.04 LTS
- **Required Software**:
  - Docker Engine
  - Docker Compose
  - AWS SSM Agent (install via snap if not present)
- **Security Groups** (CRITICAL - most common issue):
  - Port 22: SSH from your IP
  - Port 8080: API access from 0.0.0.0/0 (anywhere)
  - Port 27017: MongoDB (internal only - same security group)
  - Port 443: HTTPS (if using SSL)
- **IAM Role**: Must have `AmazonSSMManagedInstanceCore` policy attached

### Deployment Process

1. **Image Build**: Docker image built with multi-platform support
2. **Registry Push**: Image pushed to Docker Hub with version tags
3. **SSM Connection**: AWS Systems Manager connects to EC2
4. **Container Deployment**: Docker Compose deploys both API and MongoDB
5. **Health Validation**: Automated health checks verify deployment

## Service Dependencies

### Service Dependency Diagram

```mermaid
graph TD
    A[API Service] --> B[MongoDB]
    A --> C[JWT Authentication]
    A --> D[Frontend URL]
    
    E[Docker Network] --> A
    E --> B
    
    F[Volume: satoshifund-data] --> B
    
    G[Environment Variables] --> A
    G --> B
    
    H[Port 8080] --> A
    I[Port 27017] --> B
```

### Docker Compose Services

```yaml
services:
  api:
    depends_on:
      - mongo
    environment:
      - MONGODB_URI
      - NODE_ENV
      - JWT_SECRET
      - FRONTEND_URL
    
  mongo:
    volumes:
      - satoshifund-data:/data/db
```

## Configuration Guide

### Required GitHub Secrets

Configure these in Settings → Secrets and variables → Actions:

| Secret Name | Description | Example | Notes |
|------------|-------------|---------|-------|
| `DOCKERHUB_USERNAME` | Docker Hub username | `johndoe` | Required for image push |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_xxxxx` | Use token, not password |
| `JWT_SECRET` | Production JWT secret | `complex-random-string` | Generate with `openssl rand -base64 32` |
| `FRONTEND_URL` | Production frontend URL | `https://app.example.com` | Your frontend domain |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAXXXXXXXXXXXXXXXX` | For deployment |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/xxxxx` | Keep secure |
| `EC2_INSTANCE_ID` | EC2 instance identifier | `i-0123456789abcdef0` | Your EC2 instance ID |
| `EC2_HOST` | EC2 public hostname | `ec2-xx-xxx-xxx-xxx.ap-southeast-2.compute.amazonaws.com` | Your EC2 public DNS |

### Environment Variables

**Local Development (`.env`):**
```env
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/satoshifund-dev
JWT_SECRET=local_dev_secret
FRONTEND_URL=http://localhost:3000
```

**Production (via GitHub Secrets):**
- Automatically injected during CI/CD pipeline
- Secured and encrypted by GitHub
- Never exposed in logs

## Replication Instructions

### Prerequisites

1. **GitHub Repository**
   - Fork or clone this repository
   - Enable GitHub Actions in repository settings

2. **Docker Hub Account**
   - Create account at hub.docker.com
   - Generate access token: Account Settings → Security → Access Tokens

3. **AWS Account**
   - Create AWS account (12-month free tier available)
   - Have AWS Console access ready

## Detailed AWS Setup Guide

### Part 1: Launch EC2 Instance

1. **Navigate to EC2 Dashboard**
   - Sign in to AWS Console
   - Search for "EC2" in the top search bar
   - Click "EC2" to open the dashboard
   - Click orange "Launch instance" button

2. **Name and Tags**
   - Name: `satoshifund-backend`
   - Add tags (optional):
     - Key: `Environment`, Value: `production`
     - Key: `Application`, Value: `satoshifund`

3. **Choose AMI (Operating System)**
   - Select "Ubuntu"
   - Choose "Ubuntu Server 22.04 LTS (HVM), SSD Volume Type"
   - Architecture: 64-bit (x86)
   - Ensure it says "Free tier eligible"

4. **Instance Type**
   - Select `t2.micro` (1 vCPU, 1 GB Memory)
   - ✅ Must show "Free tier eligible"

5. **Key Pair (CRITICAL)**
   - Click "Create new key pair"
   - Key pair name: `satoshifund-key`
   - Key pair type: RSA
   - Private key file format: .pem
   - **⚠️ DOWNLOAD THE KEY - You can't download it again!**
   - Save it securely

6. **Network Settings**
   - Click "Edit" next to Network settings
   - VPC: Use default
   - Subnet: No preference
   - Auto-assign public IP: Enable
   
   **Security Group (CRITICAL):**
   - Create security group
   - Security group name: `satoshifund-sg`
   - Description: `Security group for SatoshiFund backend`
   
   **Add Security Group Rules:**
   - Rule 1 (SSH):
     - Type: SSH
     - Port: 22
     - Source: My IP (or 0.0.0.0/0 if IP changes frequently)
   
   - Click "Add security group rule"
   - Rule 2 (API):
     - Type: Custom TCP
     - Port: 8080
     - Source: 0.0.0.0/0
     - Description: API access
   
   - Click "Add security group rule"
   - Rule 3 (MongoDB):
     - Type: Custom TCP
     - Port: 27017
     - Source: Custom → Select the security group itself (self-reference)
     - Description: MongoDB internal

7. **Configure Storage**
   - 8 GB gp3 (default)
   - ✅ Free tier eligible up to 30 GB

8. **Advanced Details** (Important!)
   - Click to expand
   - IAM instance profile: Leave empty for now (we'll create and attach later)
   - Everything else: Leave as default

9. **Review and Launch**
   - Review all settings
   - Click "Launch instance"
   - Wait for "Success" message
   - Click "View all instances"

10. **Note Your Instance Details**
    - Wait for Instance State: "Running"
    - Note down:
      - Instance ID: `i-xxxxxxxxxxxxxxxxx`
      - Public IPv4 DNS: `ec2-xx-xxx-xxx-xxx.ap-southeast-2.compute.amazonaws.com`
      - Public IPv4 address: `xx.xxx.xxx.xxx`

### Part 2: Create IAM Role for EC2 SSM Access

1. **Navigate to IAM**
   - AWS Console → Search "IAM" → Click IAM
   - Left sidebar → Click "Roles"
   - Click "Create role"

2. **Select Trusted Entity**
   - Trusted entity type: AWS service
   - Service: EC2
   - Use case: EC2
   - Click "Next"

3. **Add Permissions**
   - Search for: `AmazonSSMManagedInstanceCore`
   - ✅ Check the box next to it
   - Click "Next"

4. **Name and Create**
   - Role name: `satoshifund-ec2-ssm-role`
   - Description: `Allows EC2 instances to use Systems Manager`
   - Click "Create role"

5. **Attach Role to EC2**
   - Go back to EC2 Console
   - Select your instance
   - Actions → Security → Modify IAM role
   - IAM role: Select `satoshifund-ec2-ssm-role`
   - Click "Update IAM role"

### Part 3: Create IAM User for GitHub Actions

1. **Create Custom Policy First**
   - IAM Console → Policies → Create policy
   - Click "JSON" tab
   - Paste this exactly:
   ```json
   {
     "Version": "2012-10-17",
     "Statement": [
       {
         "Effect": "Allow",
         "Action": [
           "ssm:SendCommand",
           "ssm:GetCommandInvocation",
           "ssm:ListCommandInvocations"
         ],
         "Resource": "*"
       },
       {
         "Effect": "Allow",
         "Action": [
           "ec2:DescribeInstances",
           "ec2:DescribeInstanceStatus"
         ],
         "Resource": "*"
       }
     ]
   }
   ```
   - Click "Next: Tags" → "Next: Review"
   - Policy name: `SatoshiFund-Deploy-Policy`
   - Click "Create policy"

2. **Create IAM User**
   - IAM Console → Users → Create user
   - User name: `github-actions-satoshifund`
   - Click "Next"

3. **Set Permissions**
   - Select "Attach policies directly"
   - Search for: `SatoshiFund-Deploy-Policy`
   - ✅ Check the box
   - Click "Next" → "Create user"

4. **Create Access Keys**
   - Click on the username you just created
   - Click "Security credentials" tab
   - Scroll to "Access keys" → Click "Create access key"
   - Select "Command Line Interface (CLI)"
   - ✅ Check "I understand..."
   - Click "Next"
   - Description: `GitHub Actions CI/CD`
   - Click "Create access key"
   
5. **SAVE CREDENTIALS** ⚠️
   - **Access key ID**: Copy and save (looks like `AKIAXXXXXXXXX`)
   - **Secret access key**: Copy and save (you won't see this again!)
   - Click "Download .csv file" as backup
   - Click "Done"

### Part 4: Fix SSH Key Permissions (Local Machine)

Before you can SSH into your EC2:

```bash
# Navigate to where you downloaded the key
cd ~/Downloads  # or wherever you saved it

# Fix permissions (REQUIRED - SSH will reject keys with wrong permissions)
chmod 400 satoshifund-key.pem

# Move to a safe location
mkdir -p ~/.ssh/aws
mv satoshifund-key.pem ~/.ssh/aws/
```

### Part 5: Configure EC2 Instance

SSH into your EC2 instance and install required software:

```bash
# SSH into EC2 instance (use your actual EC2 public DNS)
ssh -i ~/.ssh/aws/satoshifund-key.pem ubuntu@ec2-xx-xxx-xxx-xxx.ap-southeast-2.compute.amazonaws.com

# If key is in different location, adjust path:
# ssh -i /path/to/satoshifund-key.pem ubuntu@your-ec2-dns

# Install Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker ubuntu

# Install Docker Compose (ensure full command is copied)
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login again for docker group changes to take effect
exit
# Then SSH back in

# Verify installations
docker --version
docker-compose --version

# Install SSM agent if not present (Ubuntu via snap)
sudo snap install amazon-ssm-agent --classic
sudo snap start amazon-ssm-agent
sudo snap services amazon-ssm-agent
# Should show: enabled and active
```

### Part 6: Configure GitHub Secrets

**Note**: The IAM policy was already created in Part 3. Now we'll add the secrets to GitHub.

1. **Navigate to GitHub Repository Settings**
   - Go to your repository on GitHub
   - Click Settings → Secrets and variables → Actions
   - Click "New repository secret" for each

2. **Add Required Secrets** (use values from previous steps):
   
   | Secret Name | Where to Find Value |
   |-------------|--------------------|
   | `DOCKERHUB_USERNAME` | Your Docker Hub username |
   | `DOCKERHUB_TOKEN` | Docker Hub access token (Prerequisites) |
   | `JWT_SECRET` | Generate: `openssl rand -base64 32` |
   | `FRONTEND_URL` | Use `http://localhost:3000` for now |
   | `AWS_ACCESS_KEY_ID` | From Part 3, Step 5 (CSV file) |
   | `AWS_SECRET_ACCESS_KEY` | From Part 3, Step 5 (CSV file) |
   | `EC2_INSTANCE_ID` | From Part 1, Step 10 |
   | `EC2_HOST` | From Part 1, Step 10 (Public DNS) |

### Part 7: Deploy to Production

1. Push code to `production` branch:
```bash
git checkout -b production
git push origin production
```

2. Monitor deployment:
   - Go to Actions tab in GitHub
   - Watch workflow execution
   - Check logs for each step

3. Verify deployment:
```bash
# First test from your local machine
curl http://your-ec2-host:8080/health

# If that fails, SSH into EC2 to debug
ssh -i satoshifund-key.pem ubuntu@your-ec2-host

# Check running containers
docker ps
# Should show 2 containers: satoshifund-api and satoshifund-mongo

# Check container logs if needed
docker logs satoshifund-api
docker logs satoshifund-mongo

# Test from inside EC2
curl http://localhost:8080/health
```

## Setup Verification Checklist

Before pushing to production, verify you have completed:

### AWS Setup
- [ ] EC2 instance launched (t2.micro, Ubuntu 22.04)
- [ ] Security group has ports 22, 8080, 27017 configured
- [ ] IAM role `satoshifund-ec2-ssm-role` attached to EC2
- [ ] SSH key `satoshifund-key.pem` saved with 400 permissions
- [ ] Can SSH into EC2 instance successfully
- [ ] Docker and Docker Compose installed on EC2
- [ ] SSM agent running on EC2

### GitHub Setup
- [ ] All 8 secrets added to GitHub repository
- [ ] AWS access keys are from `github-actions-satoshifund` user
- [ ] EC2_INSTANCE_ID matches your instance
- [ ] EC2_HOST is the public DNS (not private IP)

### Testing
- [ ] Can access EC2 via: `curl http://[EC2-HOST]:8080/health` (after deployment)
- [ ] GitHub Actions workflows show green checkmarks

## Post-Deployment Verification Checklist

1. ✅ Security group has port 8080 open to 0.0.0.0/0
2. ✅ Both containers running: `docker ps` shows 2 containers
3. ✅ Health endpoint responds: `curl http://ec2-host:8080/health`
4. ✅ Logs show no errors: `docker logs satoshifund-api`
5. ✅ SSM agent is active: `sudo snap services amazon-ssm-agent`
6. ✅ GitHub Actions show green checkmarks for all jobs

---

## References

Amazon Web Services (n.d.) AWS Systems Manager [online]. Available at: https://docs.aws.amazon.com/systems-manager/ (Accessed: 24 August 2025).

Amazon Web Services (n.d.) Amazon Elastic Compute Cloud (EC2) Documentation [online]. Available at: https://docs.aws.amazon.com/ec2/ (Accessed: 24 August 2025).

Anyanwu, C. (2025) ‘How to Automate CI/CD with GitHub Actions and Streamline Your Workflow’, freeCodeCamp.org [online]. Available at: https://www.freecodecamp.org/news/automate-cicd-with-github-actions-streamline-workflow/ (Accessed: 24 August 2025).

Docker (n.d.) Docker Docs [online]. Available at: https://docs.docker.com (Accessed: 24 August 2025).

Docker Hub (n.d.) MongoDB Docker Guide [online]. Available at: https://hub.docker.com/_/mongo (Accessed: 24 August 2025).

GitHub (2024) CI/CD: The what, why, and how [online]. Available at: https://resources.github.com/devops/ci-cd/?topic=devops (Accessed: 24 August 2025).

GitHub (n.d.) GitHub Actions documentation [online]. Available at: https://docs.github.com/en/actions (Accessed: 24 August 2025).

GitHub (n.d.) Running variations of jobs in a workflow, GitHub Actions documentation [online]. Available at: https://docs.github.com/en/actions/how-tos/write-workflows/choose-what-workflows-do/run-job-variations (Accessed: 24 August 2025).

GitHub Blog (2025) Douglas, B. How to build a CI/CD pipeline with GitHub Actions in four simple steps, GitHub Blog [online]. Available at: https://github.blog/enterprise-software/ci-cd/build-ci-cd-pipeline-github-actions-four-steps/ (Accessed: 24 August 2025).

Hyett, A. (2023) ‘CI/CD Pipeline Using GitHub Actions: Automate Software Delivery (for free)’, YouTube video, 12:11. Available at: https://www.youtube.com/watch?v=p3W2XCD3smk (Accessed: 24 August 2025).

Shaw, T. (2024) ‘CI/CD Tutorial using GitHub Actions – Automated Testing & Automated Deployments’, YouTube video, 6:12. Available at: https://www.youtube.com/watch?v=YLtlz88zrLg (Accessed: 24 August 2025).