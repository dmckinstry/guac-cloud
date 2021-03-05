provider “aws” {
  profile = “default”
  region = “us-east-1”
}
resource “aws_instance” “test-sm-ec2” {
  ami = “ami-08f3d892de259504d” #make sure to get the updated ami name for your region
  instance_type = “t2.micro” #choose which size to use, be aware of costs if going out of free tier
}
