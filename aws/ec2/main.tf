terraform {
  backend "remote" {
    organization = "guac_cloud"

    workspaces {
      name = "aws_cloud"
    }
  }
}
provider "aws" {
  profile = "default"
  region = "us-west-2"
}
resource "aws_instance" "test-sm-ec2" {
  ami = "ami-b9401b89" #make sure to get the updated ami name for your region
  instance_type = "t2.micro" #choose which size to use, be aware of costs if going out of free tier
}
