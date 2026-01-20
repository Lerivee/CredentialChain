// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract CredentialChain {

    struct Credential {
        string studentName;
        string matricNo;
        string course;
        string degree;
        uint256 year;
        bool exists;
    }

    mapping(string => Credential) private credentials;

    event CredentialIssued(
        string matricNo,
        string studentName,
        string course,
        string degree,
        uint256 year
    );

    function issueCredential(
        string memory _studentName,
        string memory _matricNo,
        string memory _course,
        string memory _degree,
        uint256 _year
    ) public {
        require(!credentials[_matricNo].exists, "Credential already exists");

        credentials[_matricNo] = Credential(
            _studentName,
            _matricNo,
            _course,
            _degree,
            _year,
            true
        );

        emit CredentialIssued(
            _matricNo,
            _studentName,
            _course,
            _degree,
            _year
        );
    }

    function verifyCredential(string memory _matricNo)
        public
        view
        returns (
            string memory,
            string memory,
            string memory,
            string memory,
            uint256
        )
    {
        require(credentials[_matricNo].exists, "Credential not found");

        Credential memory c = credentials[_matricNo];
        return (
            c.studentName,
            c.matricNo,
            c.course,
            c.degree,
            c.year
        );
    }
}