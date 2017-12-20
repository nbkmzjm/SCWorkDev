module.exports = {
  apps : [
      {
        name: "wko",
        script: "./server.js",
        watch: true,
        env: {
            "NODE_ENV": "development"
        },
        env_production: {
            "NODE_ENV": "production",
            "AWS_ACCESS_KEY_ID"="AKIAIWH4VYRSOTAEFVQA"
            "AWS_SECRET_ACCESS_KEY"="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"
            "GCMAPIKey"="AIzaSyAVHtFMejQX7To7UwVqi4MWzWIfBP1qWAc"
            "S3Bucket"="scworkdev"
            "DATABASE_URL"="postgres://nbkmzjm:Fish1ing!85@wkoinstance.cpz3l8fshdry.us-east-2.rds.amazonaws.com:5432/wkoDB"
        }
      }
  ]
}