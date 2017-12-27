set serveroutput on;
DECLARE
    v_deptno dept.deptno%TYPE;
    
BEGIN
    v_deptno := &v_deptno;
    
    delete
    from dept
    where deptno = v_deptno;
    
    dbms_output.put_line(SQL%ROWCOUNT || ' randuri afectate.');
	
END;
