import os
#os.system('cd ./aws/ec2; terraform output > terraform.output')
with open('./terraform.output.sh', 'w') as writer:
    with open('./terraform.output') as reader:
        for line in reader.readlines():
            if (line[0].isalpha() and ' = ' in line): # strip debug info if present
                command = 'TF_' + line.strip().replace(' = ', '=')
                writer.write( command )
#                print( command )
os.system('chmod +x ./terraform.output.sh')
# in the script use: . ./script.sh
