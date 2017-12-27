set serveroutput on;
DECLARE
    v_deptno dept.deptno%TYPE;
    v_loc dept.loc%TYPE;
    v_dname dept.dname%TYPE;
    
BEGIN
    v_loc := &v_loc;
    v_deptno := &v_deptno;
    
	update dept
    set loc = v_loc
    where deptno = v_deptno;
    
    select dept.DEPTNO, dept.DNAME, dept.LOC 
    into v_deptno, v_dname, v_loc
    from dept
    where deptno = v_deptno;
    
    dbms_output.put_line(v_deptno || ' ' || v_dname || ' ' || v_loc);
END;
