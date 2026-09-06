pipeline {
    agent any
    stages {
        stage('Install & Build Client') {
            steps {
                sh 'npm --prefix client ci || npm --prefix client install'
                sh 'npm --prefix client run build'
            }
        }
        stage('Install Server Deps') {
            steps {
                sh 'npm ci --only=production || npm install --production'
            }
        }
        stage('Build Docker Image') {
            steps {
                script { docker.build('aadhaar-chat:latest') }
            }
        }
    }
    post {
        success {
            echo '✅ Build succeeded: aadhaar-chat:latest'
            echo 'Run: docker compose up -d'
        }
        failure { error '❌ Build failed' }
    }
}
