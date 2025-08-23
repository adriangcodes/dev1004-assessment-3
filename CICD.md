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
- **Dependencies**: Requires build job success
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

| Secret Name | Description | Example |
|------------|-------------|---------|
| `DOCKERHUB_USERNAME` | Docker Hub username | `johndoe` |
| `DOCKERHUB_TOKEN` | Docker Hub access token | `dckr_pat_xxxxx` |
| `JWT_SECRET` | Production JWT secret | `complex-random-string` |
| `FRONTEND_URL` | Production frontend URL | `https://app.example.com` |
| `AWS_ACCESS_KEY_ID` | AWS IAM access key | `AKIAXXXXXXXXXXXXXXXX` |
| `AWS_SECRET_ACCESS_KEY` | AWS IAM secret key | `wJalrXUtnFEMI/K7MDENG/xxxxx` |
| `EC2_INSTANCE_ID` | EC2 instance identifier | `i-0123456789abcdef0` |
| `EC2_HOST` | EC2 public hostname | `ec2-xx-xxx-xxx-xxx.ap-southeast-2.compute.amazonaws.com` |

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
   - Create AWS account
   - Set up IAM user with EC2 and SSM permissions
   - Launch EC2 instance with Ubuntu 22.04

### Step-by-Step Setup

#### 1. Prepare EC2 Instance

```bash
# Fix SSH key permissions first (required!)
chmod 400 satoshifund-key.pem

# SSH into EC2 instance
ssh -i satoshifund-key.pem ubuntu@your-ec2-host

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

#### 2. Configure AWS IAM

Create IAM policy with these permissions:
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
        "ec2:DescribeInstances"
      ],
      "Resource": "*"
    }
  ]
}
```

#### 3. Configure GitHub Secrets

1. Navigate to repository Settings → Secrets and variables → Actions
2. Add each secret from the Configuration Guide table
3. For multi-line values, paste entire content
4. **Critical secrets to double-check**:
   - `EC2_HOST`: Must be the public DNS/IP (not private IP)
   - `EC2_INSTANCE_ID`: Must match your instance exactly
   - `DOCKERHUB_USERNAME`: Your Docker Hub username (without @)
   - `DOCKERHUB_TOKEN`: Access token, not password

#### 4. Update Configuration Files

1. **Update `.env.github-secrets`** with your specific values:
```bash
AWS_ACCESS_KEY_ID=your-actual-key
AWS_SECRET_ACCESS_KEY=your-actual-secret
EC2_INSTANCE_ID=your-instance-id
EC2_HOST=your-ec2-hostname
```

2. **Modify Docker image name** in workflows if using different registry:
```yaml
IMAGE_NAME: ${{ secrets.DOCKERHUB_USERNAME }}/your-app-name
```

#### 5. Deploy

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

## Troubleshooting

### Common Issues and Solutions

#### 1. Docker Build Failures

**Issue**: `Cannot connect to Docker daemon`
```yaml
# Solution: Ensure Docker Buildx is set up
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3
```

#### 2. AWS SSM Connection Issues

**Issue**: `Instance not found`
- Verify EC2_INSTANCE_ID is correct
- Ensure instance has SSM agent running
- Check IAM permissions include SSM access

#### 3. MongoDB Connection Failures

**Issue**: `MongoNetworkError`
- Verify Docker network configuration
- Check MongoDB container is running
- Ensure correct MONGODB_URI format

#### 4. Test Failures

**Issue**: `Jest tests timeout`
```yaml
# Solution: Increase test timeout
- name: Run tests
  run: npm test -- --testTimeout=30000
```

#### 5. MongoDB Service Timeout in GitHub Actions

**Issue**: `Process completed with exit code 124` (timeout waiting for MongoDB)
- The mongosh command may not be available in GitHub Actions
- Solution: Remove the "Wait for MongoDB" step - service health checks are sufficient
- The MongoDB service container's built-in health checks will ensure readiness

#### 6. Health Check Timeout During Deployment

**Issue**: Health check takes too long or times out
- **Most common cause**: Security group port 8080 not open
- Solution: Add inbound rule for port 8080 from 0.0.0.0/0
- Verify in AWS Console: EC2 → Instance → Security → Security groups → Inbound rules
- Test locally first: `ssh -i key.pem ubuntu@ec2-host` then `curl localhost:8080/health`

#### 7. SSH Key Permission Error

**Issue**: `Permissions 0644 for 'key.pem' are too open`
```bash
# Fix permissions
chmod 400 your-key.pem
```

#### 8. Artifact Upload Issues

**Issue**: `No files found for artifact`
- Check file paths in workflow
- Ensure tests generate output files
- Verify artifact retention settings

### Debugging Commands

```bash
# View GitHub Actions logs
gh run list
gh run view <run-id>

# Check EC2 deployment
aws ssm get-command-invocation --command-id <command-id> --instance-id <instance-id>

# Test if EC2 deployment is working
curl http://your-ec2-host:8080/health

# Test port connectivity
nc -zv your-ec2-host 8080

# Docker debugging on EC2
docker logs satoshifund-api
docker logs satoshifund-mongo
docker-compose ps
docker-compose logs -f

# Network debugging
docker network ls
docker network inspect satoshifund-net
```

## Maintenance

### Regular Tasks

- **Immediately after setup**: Test health endpoint from browser and curl
- **Weekly**: Review and rotate secrets
- **Monthly**: Update dependencies and base images
- **Quarterly**: Audit IAM permissions and security groups
- **Annually**: Review and optimize pipeline performance

### Post-Deployment Verification Checklist

1. ✅ Security group has port 8080 open to 0.0.0.0/0
2. ✅ Both containers running: `docker ps` shows 2 containers
3. ✅ Health endpoint responds: `curl http://ec2-host:8080/health`
4. ✅ Logs show no errors: `docker logs satoshifund-api`
5. ✅ SSM agent is active: `sudo snap services amazon-ssm-agent`
6. ✅ GitHub Actions show green checkmarks for all jobs

### Monitoring

- Enable GitHub Actions notifications
- Set up AWS CloudWatch for EC2 monitoring
- Configure application-level health checks
- Implement alerting for deployment failures

---

## Additional Resources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Docker Documentation](https://docs.docker.com)
- [AWS Systems Manager](https://docs.aws.amazon.com/systems-manager/)
- [MongoDB Docker Guide](https://hub.docker.com/_/mongo)